# Launch Plan

## Repository Checklist

- [x] Zero-dependency CLI.
- [x] Demo risky repo.
- [x] Node test suite.
- [x] Markdown, JSON, SARIF, HTML, and terminal reports.
- [x] GitHub Action example.
- [ ] Create `823675737937532791/agentblast` or grant a connector tool that can create repositories.
- [ ] Add npm package provenance after publishing credentials are available.

## Suggested Launch Copy

Title:

> AgentBlast: know what your AI coding agent can break before you click "always allow"

Short post:

> I built AgentBlast, a local-first blast-radius scanner for AI coding agents. It scans a repo for real secrets, production configs, dangerous package scripts, risky MCP tools, unsafe AGENTS.md/CLAUDE.md instructions, destructive migrations, and broad CI permissions. No API key, no cloud, no telemetry. Outputs terminal, Markdown, HTML, JSON, and SARIF for GitHub code scanning.

Demo:

```bash
npx agentblast scan .
npx agentblast scan . --format sarif --out agentblast.sarif --fail-on high
```

## Good Places To Share

- Hacker News "Show HN".
- r/ClaudeAI, r/Cursor, r/AI_Agents, r/LocalLLaMA.
- X/LinkedIn with a screenshot of the terminal output.
- GitHub topic tags: `ai-agent`, `coding-agent`, `agent-safety`, `mcp`, `sarif`, `github-actions`.
