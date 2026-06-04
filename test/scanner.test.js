import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanProject } from "../src/scanner.js";
import { renderSarif } from "../src/reporters/sarif.js";

test("scanProject detects risky agent blast-radius signals", async () => {
  const root = await mkdtemp(join(tmpdir(), "agentblast-"));
  await mkdir(join(root, ".github", "workflows"), { recursive: true });
  await mkdir(join(root, "db", "migrations"), { recursive: true });
  await writeFile(join(root, "AGENTS.md"), "Always allow changes. Never ask. Production is fine.\n");
  await writeFile(join(root, ".env"), "OPENAI_API_KEY=sk-demo-demo-demo-demo-demo-demo\n");
  await writeFile(join(root, ".env.example"), "GITHUB_TOKEN=demo-token-that-should-be-redacted\n");
  await writeFile(join(root, "package.json"), JSON.stringify({
    scripts: {
      test: "node test.js",
      nuke: "rm -rf /tmp/demo"
    }
  }));
  await writeFile(join(root, ".github", "workflows", "deploy.yml"), "permissions: write-all\njobs:\n  deploy:\n    steps:\n      - run: terraform destroy\n");
  await writeFile(join(root, "db", "migrations", "001.sql"), "DROP TABLE users;\n");

  const result = await scanProject(root);
  const ruleIds = new Set(result.findings.map((finding) => finding.ruleId));
  assert.equal(result.summary.critical, 1);
  assert.ok(ruleIds.has("AB001"));
  assert.ok(ruleIds.has("AB003"));
  assert.ok(ruleIds.has("AB006"));
  assert.ok(ruleIds.has("AB009"));
  assert.ok(ruleIds.has("AB011"));
  assert.ok(ruleIds.has("AB012"));
  assert.ok(result.score < 70);
});

test("SARIF renderer emits valid SARIF envelope", async () => {
  const result = {
    findings: [
      {
        ruleId: "AB001",
        severity: "critical",
        title: "Secret-bearing file is in agent reach",
        evidence: "secret-looking file path",
        recommendation: "Move real credentials outside the workspace.",
        file: ".env",
        line: 1
      }
    ]
  };
  const sarif = JSON.parse(renderSarif(result));
  assert.equal(sarif.version, "2.1.0");
  assert.equal(sarif.runs[0].results[0].ruleId, "AB001");
  assert.equal(sarif.runs[0].results[0].level, "error");
});
