import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const DEFAULT_CONFIG = {
  ignore: [
    ".git/**",
    "node_modules/**",
    "vendor/**",
    "dist/**",
    "build/**",
    "coverage/**",
    ".next/**",
    ".turbo/**",
    ".venv/**",
    "__pycache__/**"
  ],
  severityOverrides: {},
  allowRules: []
};

export async function loadConfig(root, explicitPath) {
  const candidates = explicitPath
    ? [resolve(explicitPath)]
    : [join(root, ".agentblast.json"), join(root, ".agentblastrc")];

  for (const candidate of candidates) {
    try {
      const body = await readFile(candidate, "utf8");
      const parsed = JSON.parse(body);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        ignore: [...DEFAULT_CONFIG.ignore, ...(parsed.ignore || [])],
        configPath: candidate
      };
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw new Error(`Could not read AgentBlast config at ${candidate}: ${error.message}`);
    }
  }

  return { ...DEFAULT_CONFIG, configPath: null };
}

export function shouldIgnore(relativePath, config) {
  return config.ignore.some((pattern) => matchGlobish(relativePath, pattern));
}

export function isAllowed(finding, config) {
  return config.allowRules.some((allow) => {
    if (typeof allow === "string") return finding.ruleId === allow;
    if (allow.ruleId && finding.ruleId !== allow.ruleId) return false;
    if (allow.path && !matchGlobish(finding.file || "", allow.path)) return false;
    return true;
  });
}

export function applySeverityOverride(ruleId, severity, config) {
  return config.severityOverrides[ruleId] || severity;
}

function matchGlobish(path, pattern) {
  const normalizedPath = path.replaceAll("\\", "/");
  const normalizedPattern = pattern.replaceAll("\\", "/");
  if (normalizedPattern.endsWith("/**")) {
    return normalizedPath === normalizedPattern.slice(0, -3) ||
      normalizedPath.startsWith(normalizedPattern.slice(0, -2));
  }
  if (normalizedPattern.startsWith("**/")) {
    return normalizedPath.endsWith(normalizedPattern.slice(3));
  }
  if (normalizedPattern.includes("*")) {
    const regex = new RegExp(`^${escapeRegex(normalizedPattern).replaceAll("\\*", ".*")}$`);
    return regex.test(normalizedPath);
  }
  return normalizedPath === normalizedPattern;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}
