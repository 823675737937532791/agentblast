#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanProject } from "../src/scanner.js";
import { initProject } from "../src/init.js";
import { renderHtml } from "../src/reporters/html.js";
import { renderJson } from "../src/reporters/json.js";
import { renderMarkdown } from "../src/reporters/markdown.js";
import { renderSarif } from "../src/reporters/sarif.js";
import { renderTerminal } from "../src/reporters/terminal.js";
import { RULES } from "../src/rules.js";

const VERSION = "0.1.0";

async function main(argv) {
  const [command = "help", ...rest] = argv;

  if (command === "--help" || command === "-h" || command === "help") {
    console.log(helpText());
    return 0;
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return 0;
  }

  if (command === "scan") {
    return runScan(rest);
  }

  if (command === "demo") {
    const demoPath = fileURLToPath(new URL("../examples/risky-repo", import.meta.url));
    return runScan([demoPath, "--format", "terminal"]);
  }

  if (command === "init") {
    return runInit(rest);
  }

  if (command === "explain") {
    return runExplain(rest);
  }

  console.error(`Unknown command: ${command}`);
  console.error("Run `agentblast help` for usage.");
  return 2;
}

async function runScan(args) {
  const options = parseArgs(args);
  const target = resolve(options._[0] || ".");
  const format = options.format || "terminal";
  const result = await scanProject(target, {
    configPath: options.config,
    maxFiles: Number(options["max-files"] || 8000)
  });

  const output = renderByFormat(format, result);
  if (options.out) {
    const outPath = resolve(options.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output);
  } else if (!options.quiet) {
    console.log(output);
  }

  if (shouldFail(result, options["fail-on"])) {
    return 1;
  }
  return 0;
}

async function runInit(args) {
  const options = parseArgs(args);
  const target = resolve(options._[0] || ".");
  const result = await initProject(target, { force: Boolean(options.force) });
  for (const file of result.created) {
    console.log(`created ${file}`);
  }
  for (const file of result.skipped) {
    console.log(`skipped ${file}`);
  }
  return 0;
}

function runExplain(args) {
  const id = args[0];
  if (!id) {
    console.error("Usage: agentblast explain <rule-id>");
    return 2;
  }
  const rule = RULES.find((item) => item.id.toLowerCase() === id.toLowerCase());
  if (!rule) {
    console.error(`Unknown rule: ${id}`);
    return 2;
  }
  console.log(`${rule.id}: ${rule.title}
Severity: ${rule.severity}
Category: ${rule.category}

${rule.description}

Fix: ${rule.recommendation}`);
  return 0;
}

function renderByFormat(format, result) {
  if (format === "terminal") return renderTerminal(result);
  if (format === "json") return renderJson(result);
  if (format === "markdown" || format === "md") return renderMarkdown(result);
  if (format === "sarif") return renderSarif(result);
  if (format === "html") return renderHtml(result);
  throw new Error(`Unsupported format: ${format}`);
}

function shouldFail(result, failOn) {
  if (!failOn) return false;
  if (failOn.startsWith("score=")) {
    const threshold = Number(failOn.slice("score=".length));
    return result.score < threshold;
  }

  const order = { low: 1, medium: 2, high: 3, critical: 4 };
  const threshold = order[failOn] || 0;
  if (!threshold) {
    throw new Error("--fail-on must be low, medium, high, critical, or score=<n>");
  }
  return result.findings.some((finding) => order[finding.severity] >= threshold);
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      parsed[rawKey] = inlineValue;
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[rawKey] = true;
      continue;
    }
    parsed[rawKey] = next;
    index += 1;
  }
  return parsed;
}

function helpText() {
  return `AgentBlast ${VERSION}

Local-first blast-radius scanner for AI coding agents.

Usage:
  agentblast scan [path] [--format terminal|json|markdown|sarif|html] [--out file]
  agentblast scan [path] --fail-on high
  agentblast demo
  agentblast init [path]
  agentblast explain <rule-id>

Examples:
  npx agentblast scan .
  npx agentblast scan . --format sarif --out agentblast.sarif --fail-on high
  npx agentblast init .

Why it exists:
  Before you click "always allow" on a coding agent, know what it can break.`;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
