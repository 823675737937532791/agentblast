export const RULES = [
  {
    id: "AB001",
    title: "Secret-bearing file is in agent reach",
    severity: "critical",
    category: "Secrets",
    description: "Files such as .env, private keys, credentials, and token stores are readable by local coding agents unless excluded by policy.",
    recommendation: "Move real secrets outside the workspace, keep only redacted examples, and add explicit deny rules for agent sessions."
  },
  {
    id: "AB002",
    title: "Production config is close to editable code",
    severity: "high",
    category: "Production",
    description: "Production deployment or runtime configuration inside the repo increases the damage a mistaken tool call can cause.",
    recommendation: "Require human approval before production config changes and separate prod credentials from agent-accessible workspaces."
  },
  {
    id: "AB003",
    title: "Dangerous package script",
    severity: "high",
    category: "Commands",
    description: "Package scripts are easy for agents to discover and run. Destructive scripts need strong names, docs, and confirmation gates.",
    recommendation: "Rename destructive scripts with clear danger labels, add dry-run variants, and block them in agent policies."
  },
  {
    id: "AB004",
    title: "Destructive shell or workflow command",
    severity: "high",
    category: "Commands",
    description: "Shell snippets with force delete, database reset, cloud deletion, or force-push behavior can cause irreversible damage.",
    recommendation: "Add interactive confirmations, dry-run modes, scoped credentials, and CI-only protections around these commands."
  },
  {
    id: "AB005",
    title: "Risky MCP or tool server configuration",
    severity: "high",
    category: "MCP",
    description: "MCP servers can extend an agent's authority into filesystems, browsers, GitHub, databases, and cloud APIs.",
    recommendation: "Use least-privilege tool configs, remove broad filesystem roots, and avoid passing production tokens through MCP env."
  },
  {
    id: "AB006",
    title: "Agent instruction encourages unsafe autonomy",
    severity: "high",
    category: "Agent Rules",
    description: "Instructions like 'never ask', 'auto approve', or 'production is safe' can override the human pause that prevents bad actions.",
    recommendation: "Replace broad autonomy instructions with explicit approval boundaries for destructive, external, production, and secret-touching actions."
  },
  {
    id: "AB007",
    title: "Agent rules are missing a safety boundary",
    severity: "medium",
    category: "Agent Rules",
    description: "Agent instruction files without production, destructive-action, secret, or approval guidance leave behavior up to model judgment.",
    recommendation: "Add a compact safety section that requires human approval for production, secrets, destructive commands, and external side effects."
  },
  {
    id: "AB008",
    title: "Deployment workflow has broad write authority",
    severity: "medium",
    category: "CI/CD",
    description: "CI workflows with deployment names or broad permissions are high-value targets for agent-authored mistakes.",
    recommendation: "Use GitHub environments, minimal permissions, protected branches, and manual approvals for production deploy jobs."
  },
  {
    id: "AB009",
    title: "Destructive database migration",
    severity: "medium",
    category: "Database",
    description: "Migrations containing DROP, DELETE, TRUNCATE, or broad ALTER statements deserve extra review when agents edit code.",
    recommendation: "Require migration review, add reversible migrations where possible, and forbid agents from running production migration commands."
  },
  {
    id: "AB010",
    title: "No obvious automated verification command",
    severity: "low",
    category: "Verification",
    description: "Agents are safer when they can run a clear test, lint, or typecheck command before proposing changes.",
    recommendation: "Expose npm scripts or documented commands for test, lint, typecheck, and build, then reference them from AGENTS.md."
  },
  {
    id: "AB011",
    title: "Credential-like placeholder may normalize secret handling",
    severity: "low",
    category: "Secrets",
    description: "Even example files can teach agents to copy credential-shaped values into code or logs.",
    recommendation: "Use obviously fake placeholders such as '<redacted>' and document that real values live outside the repo."
  },
  {
    id: "AB012",
    title: "Workflow grants write-all or broad contents write",
    severity: "medium",
    category: "CI/CD",
    description: "Broad GitHub Actions permissions increase the impact of a compromised or mistaken workflow change.",
    recommendation: "Set permissions at job scope and grant only the exact scopes required."
  }
];

export const RULE_BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));
