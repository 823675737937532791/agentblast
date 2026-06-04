# Market Research Notes

Date: 2026-06-04

## Direction Chosen

Build **AgentBlast**, a local-first blast-radius scanner for AI coding agents.

## Why This Direction

The crowded zones:

- General agent frameworks.
- Local-first observability dashboards and trace viewers.
- Rule-file editors and sync tools.
- Token and usage dashboards.

The sharper gap:

- Developers are granting coding agents local filesystem, shell, MCP, GitHub, browser, database, and cloud access.
- Most safety tooling is either runtime-specific, cloud-heavy, or focused on prompts/code after the fact.
- A repo-level preflight scanner is simple to understand, easy to run in CI, and immediately useful before a team lets agents work in a production codebase.

## Evidence

- [Open-source AI tools index](https://agentsindex.ai/open-source) and [OSSInsight AI trending](https://ossinsight.io/trending/ai) show a large and noisy agent/tooling ecosystem.
- Local-first observability is already active through tools like [AgentDbg](https://agentdbg.com/) and [AgentReplay](https://agentreplay.dev/), so a new trace dashboard is less differentiated.
- [AGENTS.md](https://github.com/openai/agents.md) establishes repo-level agent instructions as a durable surface.
- Public incidents such as the April 2026 production database deletion reported by [Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-powered-ai-coding-agent-deletes-entire-company-database-in-9-seconds-backups-zapped-after-cursor-tool-powered-by-anthropics-claude-goes-rogue) made blast radius legible to mainstream developers.
- Recent work on operational safety failures, including [What Breaks When LLMs Code?](https://arxiv.org/abs/2605.30777), supports the need for environmental constraints and safe halt behavior.

## Positioning

One-line pitch:

> Know what your coding agent can break before you click "always allow."

GitHub-star hooks:

- Works with every coding agent because it scans the repo, not a specific vendor runtime.
- No API key, no account, no telemetry.
- Outputs SARIF, Markdown, HTML, JSON, and terminal reports.
- Useful demo on a deliberately risky example repo.
- Easy future path to an MCP server and GitHub Action marketplace listing.

## Competitive Notes

AgentBlast should avoid claiming to be a full guardrail runtime. The first wedge is static preflight and CI. Runtime enforcement can come later as optional integrations.
