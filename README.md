# AgentBlast

**Know the blast radius before you click "always allow."**

AgentBlast is a local-first CLI that scans a repository for the things AI coding agents can accidentally break: real secrets, production config, dangerous package scripts, broad MCP tools, unsafe agent instructions, destructive migrations, and permissive CI workflows.

It is built for teams using Codex, Claude Code, Cursor, Gemini CLI, Copilot agents, Cline, OpenCode, or any coding assistant that can read files and run commands.

```bash
npx agentblast scan .
```

```text
AgentBlast /your/repo

42/100  grade F  Unbounded
files 31  findings 8  duration 24ms
critical 1  high 4  medium 2  low 1

CRITICAL AB001 Secret-bearing file is in agent reach
  .env:1  secret-looking file path
  fix: Keep real credentials outside the agent workspace.

HIGH AB006 Agent instruction encourages unsafe autonomy
  AGENTS.md:3  unsafe autonomy wording
  fix: Replace with explicit approval boundaries.
```

## Why This Exists

The agent market is crowded with frameworks and dashboards. The sharper gap is operational safety before an agent acts with your local identity.

Signals from the 2026 ecosystem:

- Agent frameworks and observability tools are multiplying fast, including local-first debuggers such as [AgentDbg](https://agentdbg.com/) and [AgentReplay](https://agentreplay.dev/).
- Repo-level instruction files are becoming standard through projects such as [AGENTS.md](https://github.com/openai/agents.md), but teams now maintain multiple rule files across tools.
- Public incidents have made the risk concrete: an AI coding agent deleting production infrastructure was widely reported in April 2026 by [Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-powered-ai-coding-agent-deletes-entire-company-database-in-9-seconds-backups-zapped-after-cursor-tool-powered-by-anthropics-claude-goes-rogue).
- Recent research on coding-agent safety failures argues guardrails need environmental constraints and safe halt behavior, not just better prompts: [What Breaks When LLMs Code?](https://arxiv.org/abs/2605.30777).

AgentBlast is intentionally small: no cloud account, no model key, no telemetry, no daemon. It answers one question quickly:

> If an agent gets confused in this repo, what can it damage?

## Features

- **Blast-radius score** from 0 to 100 with severity counts and a human-readable level.
- **Agent instruction audit** for `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.cursor/rules/*.mdc`, Copilot instructions, and more.
- **MCP/tool config audit** for filesystem, GitHub, database, browser, and token-bearing MCP servers.
- **Dangerous command detection** for `rm -rf`, force push, database reset, Terraform, Kubernetes, Docker, cloud deletion, and recursive object-store deletion.
- **Production surface detection** for deploy files, production configs, Railway/Vercel/Fly/Terraform/Kubernetes paths.
- **CI security output** with SARIF for GitHub code scanning.
- **Static reports** in terminal, JSON, Markdown, SARIF, or HTML.
- **Zero runtime dependencies** and runs on Node.js 18+.

## Install

Run without installing:

```bash
npx agentblast scan .
```

Install globally:

```bash
npm install -g agentblast
agentblast scan .
```

Use from source:

```bash
git clone https://github.com/823675737937532791/agentblast.git
cd agentblast
npm test
npm run demo
```

## Usage

Scan the current repo:

```bash
agentblast scan .
```

Write a Markdown report:

```bash
agentblast scan . --format markdown --out agentblast-report.md
```

Generate a local HTML report:

```bash
agentblast scan . --format html --out agentblast-report.html
```

Fail CI on high or critical findings:

```bash
agentblast scan . --fail-on high
```

Upload SARIF to GitHub code scanning:

```bash
agentblast scan . --format sarif --out agentblast.sarif --fail-on high
```

Bootstrap repo policy:

```bash
agentblast init .
```

Run the built-in risky demo:

```bash
agentblast demo
```

This creates:

- `.agentblast.json`
- `.github/workflows/agentblast.yml`
- `AGENTS.agentblast.md`

## Rules

| Rule | Severity | What it catches |
| --- | --- | --- |
| AB001 | Critical | Secret-bearing files inside the agent workspace |
| AB002 | High | Production config close to editable code |
| AB003 | High | Dangerous package scripts |
| AB004 | High | Destructive shell or workflow commands |
| AB005 | High | Risky MCP/tool server configuration |
| AB006 | High | Agent instructions that encourage unsafe autonomy |
| AB007 | Medium | Agent rules missing a clear safety boundary |
| AB008 | Medium | Deployment workflows that need protection |
| AB009 | Medium | Destructive database migrations |
| AB010 | Low | Missing obvious verification commands |
| AB011 | Low | Credential-like values in example files |
| AB012 | Medium | Broad GitHub Actions write permissions |

Explain a rule:

```bash
agentblast explain AB006
```

## Config

Create `.agentblast.json`:

```json
{
  "ignore": ["fixtures/**", "tmp/**"],
  "severityOverrides": {
    "AB008": "low"
  },
  "allowRules": [
    { "ruleId": "AB009", "path": "db/migrations/legacy/**" }
  ]
}
```

## GitHub Action

```yaml
name: AgentBlast

on:
  pull_request:

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
```

## What AgentBlast Is Not

AgentBlast is not a sandbox, not a runtime approval layer, and not a replacement for secret scanning or SAST. It is a fast preflight scanner that helps you harden a repo before and during agentic coding.

Pair it with:

- least-privilege credentials
- real secret scanning
- protected branches and environments
- read-only MCP defaults
- human approval for production and destructive actions

## Roadmap

- Rule packs for Claude Code hooks, Codex environments, Cursor rules, and Gemini CLI.
- Diff mode: scan only changed files but include referenced policy context.
- `agentblast map`: generate a repo blast-radius inventory for AGENTS.md.
- MCP server mode so agents can query the risk map before tool calls.
- npm provenance and signed GitHub releases.

## Development

```bash
npm test
npm run demo
npm run scan:self
```

## License

MIT
