import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { safetyBlock } from "./reporters/markdown.js";

export async function initProject(root, options = {}) {
  const created = [];
  const skipped = [];

  await writeIfMissing(
    join(root, ".agentblast.json"),
    `${JSON.stringify({
      ignore: [
        "fixtures/**",
        "tmp/**"
      ],
      severityOverrides: {},
      allowRules: []
    }, null, 2)}\n`,
    options,
    created,
    skipped
  );

  await mkdir(join(root, ".github", "workflows"), { recursive: true });
  await writeIfMissing(
    join(root, ".github", "workflows", "agentblast.yml"),
    `name: AgentBlast

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx agentblast scan . --format sarif --out agentblast.sarif --fail-on high
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: agentblast.sarif
`,
    options,
    created,
    skipped
  );

  await writeIfMissing(
    join(root, "AGENTS.agentblast.md"),
    `${safetyBlock()}\n`,
    options,
    created,
    skipped
  );

  return { created, skipped };
}

async function writeIfMissing(path, body, options, created, skipped) {
  if (!options.force) {
    try {
      await access(path);
      skipped.push(path);
      return;
    } catch {
      // Create below.
    }
  }
  await mkdir(dirnameShim(path), { recursive: true });
  await writeFile(path, body);
  created.push(path);
}

function dirnameShim(path) {
  return path.split("/").slice(0, -1).join("/") || ".";
}
