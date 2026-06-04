import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { applySeverityOverride, isAllowed, loadConfig, shouldIgnore } from "./config.js";
import {
  AGENT_FILE_PATTERNS,
  DANGEROUS_COMMAND_PATTERNS,
  EXAMPLE_SECRET_FILE_PATTERNS,
  MCP_FILE_PATTERNS,
  MIGRATION_PATTERNS,
  PRODUCTION_CONFIG_PATTERNS,
  SAFETY_BOUNDARY_PATTERNS,
  SECRET_FILE_PATTERNS,
  SECRET_VALUE_PATTERNS,
  TEXT_FILE_EXTENSIONS,
  UNSAFE_AGENT_INSTRUCTION_PATTERNS
} from "./patterns.js";
import { RULE_BY_ID } from "./rules.js";

const SEVERITY_WEIGHT = { critical: 25, high: 14, medium: 7, low: 3 };

export async function scanProject(root, options = {}) {
  const startedAt = new Date();
  const config = await loadConfig(root, options.configPath);
  const files = await collectFiles(root, config, options.maxFiles || 8000);
  const context = {
    root,
    config,
    files,
    packageJson: null,
    agentFiles: [],
    findings: [],
    findingKeys: new Set()
  };

  await scanFiles(context);
  scanProjectLevel(context);

  const findings = context.findings.filter((finding) => !isAllowed(finding, config));
  const score = calculateScore(findings);
  const completedAt = new Date();

  return {
    tool: "agentblast",
    version: "0.1.0",
    root,
    scannedAt: completedAt.toISOString(),
    durationMs: completedAt - startedAt,
    scannedFiles: files.length,
    score,
    grade: gradeForScore(score),
    level: levelForScore(score),
    summary: summarize(findings),
    findings,
    configPath: config.configPath
  };
}

async function collectFiles(root, config, maxFiles) {
  const files = [];

  async function walk(directory) {
    if (files.length >= maxFiles) return;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = join(directory, entry.name);
      const rel = relative(root, absolute).replaceAll("\\", "/");
      if (shouldIgnore(rel, config)) continue;
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push({ absolute, relative: rel });
      }
    }
  }

  await walk(root);
  return files;
}

async function scanFiles(context) {
  for (const file of context.files) {
    const path = file.relative;
    const lowerPath = path.toLowerCase();

    if (matches(path, SECRET_FILE_PATTERNS) && !matches(path, EXAMPLE_SECRET_FILE_PATTERNS)) {
      addFinding(context, "AB001", file, 1, "secret-looking file path", "Keep real credentials outside the agent workspace.");
    }

    if (matches(path, PRODUCTION_CONFIG_PATTERNS)) {
      addFinding(context, "AB002", file, 1, "production or deploy config path", "Gate production config changes with human review.");
    }

    if (matches(path, AGENT_FILE_PATTERNS)) {
      context.agentFiles.push(file);
    }

    const extension = extname(lowerPath);
    const envish = /(^|\/)\.env($|\.)/i.test(lowerPath) || lowerPath.endsWith(".env");
    const canRead = TEXT_FILE_EXTENSIONS.has(extension) || envish || lowerPath.endsWith("makefile") || lowerPath.endsWith("dockerfile");
    const metadata = await stat(file.absolute);
    if (!canRead || metadata.size > 512_000) continue;

    let body = "";
    try {
      body = await readFile(file.absolute, "utf8");
    } catch {
      continue;
    }

    if (lowerPath.endsWith("package.json")) {
      scanPackageJson(context, file, body);
    }

    if (matches(path, MCP_FILE_PATTERNS)) {
      scanMcpConfig(context, file, body);
    }

    if (matches(path, AGENT_FILE_PATTERNS)) {
      scanAgentFile(context, file, body);
    }

    if (isCommandFile(path)) {
      scanDangerousCommands(context, file, body);
    }

    if (isWorkflow(path)) {
      scanWorkflow(context, file, body);
    }

    if (matches(path, MIGRATION_PATTERNS)) {
      scanMigration(context, file, body);
    }

    if (matches(path, EXAMPLE_SECRET_FILE_PATTERNS)) {
      scanExampleSecrets(context, file, body);
    }
  }
}

function scanPackageJson(context, file, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return;
  }

  if (!context.packageJson) context.packageJson = parsed;
  for (const [name, command] of Object.entries(parsed.scripts || {})) {
    for (const matcher of DANGEROUS_COMMAND_PATTERNS) {
      if (matcher.pattern.test(command)) {
        addFinding(context, "AB003", file, lineOf(body, `"${name}"`), `${name}: ${matcher.label}`, "Rename, document, and gate this script.");
      }
    }
  }
}

function scanMcpConfig(context, file, body) {
  const signals = [
    /\bfilesystem\b/i,
    /\bgithub\b/i,
    /\bpostgres|mysql|sqlite|mongodb|redis\b/i,
    /\bbrowser|playwright|puppeteer\b/i,
    /\b(AWS|GITHUB|OPENAI|ANTHROPIC|DATABASE|SUPABASE|RAILWAY)_?[A-Z_]*(TOKEN|KEY|SECRET|URL)\b/i
  ];
  for (const pattern of signals) {
    if (pattern.test(body)) {
      addFinding(context, "AB005", file, lineOf(body, pattern), "broad MCP/tool authority", "Scope MCP servers to read-only or project-local access when possible.");
      return;
    }
  }
}

function scanAgentFile(context, file, body) {
  for (const pattern of UNSAFE_AGENT_INSTRUCTION_PATTERNS) {
    if (pattern.test(body)) {
      addFinding(context, "AB006", file, lineOf(body, pattern), "unsafe autonomy wording", "Replace with explicit approval boundaries.");
    }
  }

  const hasBoundary = SAFETY_BOUNDARY_PATTERNS.every((pattern) => pattern.test(body));
  if (!hasBoundary) {
    addFinding(context, "AB007", file, 1, "missing complete safety boundary", "Mention production, secrets, destructive actions, and approval rules.");
  }
}

function scanDangerousCommands(context, file, body) {
  for (const matcher of DANGEROUS_COMMAND_PATTERNS) {
    if (matcher.pattern.test(body)) {
      addFinding(context, "AB004", file, lineOf(body, matcher.pattern), matcher.label, "Add dry-run and approval gates around this command.");
    }
  }
}

function scanWorkflow(context, file, body) {
  const deployish = /\b(deploy|release|production|prod|publish)\b/i.test(body + " " + file.relative);
  const broadPermission = /\bpermissions:\s*write-all\b/i.test(body) || /\bcontents:\s*write\b/i.test(body);
  if (deployish) {
    addFinding(context, "AB008", file, lineOf(body, /\b(deploy|release|production|prod|publish)\b/i), "deployment workflow", "Protect deployment workflows with environments and manual approvals.");
  }
  if (broadPermission) {
    addFinding(context, "AB012", file, lineOf(body, /\b(permissions:\s*write-all|contents:\s*write)\b/i), "broad workflow permission", "Grant only the minimal permissions this job needs.");
  }
}

function scanMigration(context, file, body) {
  const destructive = /\b(DROP\s+TABLE|DROP\s+COLUMN|TRUNCATE|DELETE\s+FROM|ALTER\s+TABLE)\b/i;
  if (destructive.test(body)) {
    addFinding(context, "AB009", file, lineOf(body, destructive), "destructive SQL migration", "Require review and never let agents run this against production.");
  }
}

function scanExampleSecrets(context, file, body) {
  for (const pattern of SECRET_VALUE_PATTERNS) {
    if (pattern.test(body)) {
      addFinding(context, "AB011", file, lineOf(body, pattern), "credential-like example value", "Use redacted placeholders instead of realistic values.");
    }
  }
}

function scanProjectLevel(context) {
  const hasVerification =
    context.packageJson?.scripts?.test ||
    context.packageJson?.scripts?.lint ||
    context.packageJson?.scripts?.typecheck ||
    context.files.some((file) => /^\.github\/workflows\//.test(file.relative));

  if (!hasVerification) {
    addFinding(context, "AB010", null, null, "no test/lint/build signal", "Add obvious verification commands for agents to run.");
  }
}

function addFinding(context, ruleId, file, line, evidence, recommendation) {
  const rule = RULE_BY_ID.get(ruleId);
  const severity = applySeverityOverride(ruleId, rule.severity, context.config);
  const key = `${ruleId}:${file?.relative || "project"}:${line || 0}:${evidence}`;
  if (context.findingKeys.has(key)) return;
  context.findingKeys.add(key);
  context.findings.push({
    ruleId,
    title: rule.title,
    severity,
    category: rule.category,
    file: file?.relative || null,
    line: line || null,
    evidence,
    recommendation: recommendation || rule.recommendation
  });
}

function calculateScore(findings) {
  const penalty = findings.reduce((total, finding) => total + SEVERITY_WEIGHT[finding.severity], 0);
  return Math.max(0, 100 - Math.min(100, penalty));
}

function summarize(findings) {
  const summary = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) summary[finding.severity] += 1;
  return summary;
}

function gradeForScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 45) return "D";
  return "F";
}

function levelForScore(score) {
  if (score >= 90) return "Contained";
  if (score >= 80) return "Manageable";
  if (score >= 65) return "Elevated";
  if (score >= 45) return "Dangerous";
  return "Unbounded";
}

function isCommandFile(path) {
  return /\.(sh|bash|zsh|fish|yml|yaml|toml|tf|md)$/i.test(path) ||
    /(^|\/)(Makefile|Dockerfile|justfile|Taskfile\.ya?ml)$/i.test(path);
}

function isWorkflow(path) {
  return /^\.github\/workflows\/.+\.ya?ml$/i.test(path);
}

function matches(path, patterns) {
  return patterns.some((pattern) => pattern.test(path));
}

function lineOf(body, needle) {
  const lines = body.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (needle instanceof RegExp ? needle.test(lines[index]) : lines[index].includes(needle)) {
      return index + 1;
    }
  }
  return 1;
}
