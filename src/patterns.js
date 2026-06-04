export const AGENT_FILE_PATTERNS = [
  /^AGENTS\.md$/i,
  /^CLAUDE\.md$/i,
  /^GEMINI\.md$/i,
  /^\.cursorrules$/i,
  /^\.windsurfrules$/i,
  /^\.clinerules$/i,
  /^\.github\/copilot-instructions\.md$/i,
  /^\.cursor\/rules\/.+\.mdc$/i,
  /^\.claude\/.+\.md$/i
];

export const MCP_FILE_PATTERNS = [
  /^\.mcp\.json$/i,
  /^mcp\.json$/i,
  /^\.cursor\/mcp\.json$/i,
  /^\.claude\/settings\.json$/i,
  /^claude_desktop_config\.json$/i
];

export const SECRET_FILE_PATTERNS = [
  /(^|\/)\.env($|\.)/i,
  /(^|\/)(id_rsa|id_ed25519|id_dsa)$/i,
  /\.(pem|p12|pfx|key)$/i,
  /(^|\/)(credentials|secrets|secret)\.(json|ya?ml|toml|ini|env)$/i,
  /(^|\/)service-account.*\.json$/i
];

export const EXAMPLE_SECRET_FILE_PATTERNS = [
  /(^|\/)\.env\.example$/i,
  /(^|\/)\.env\.sample$/i,
  /(^|\/)example\.env$/i
];

export const PRODUCTION_CONFIG_PATTERNS = [
  /(^|\/)(prod|production)[^/]*\.(json|ya?ml|toml|tf|tfvars|env)$/i,
  /(^|\/)(deploy|infra|terraform|k8s|helm)\/.*(prod|production)/i,
  /(^|\/)railway\.json$/i,
  /(^|\/)vercel\.json$/i,
  /(^|\/)fly\.toml$/i
];

export const MIGRATION_PATTERNS = [
  /(^|\/)(migrations?|db\/migrate|prisma\/migrations|supabase\/migrations)\//i,
  /\.(sql)$/i
];

export const DANGEROUS_COMMAND_PATTERNS = [
  { pattern: /\brm\s+-rf\s+([/$*~.]|\S+)/i, label: "force delete" },
  { pattern: /\bgit\s+push\b.*--force/i, label: "force push" },
  { pattern: /\bgit\s+reset\b.*--hard/i, label: "hard reset" },
  { pattern: /\b(dropdb|createdb)\b/i, label: "database admin command" },
  { pattern: /\b(prisma|sequelize|typeorm)\b.*\b(migrate\s+reset|db\s+push|schema:drop)\b/i, label: "destructive ORM command" },
  { pattern: /\b(railway|flyctl|vercel|aws|gcloud|az|doctl)\b.*\b(delete|destroy|remove|rm)\b/i, label: "cloud deletion command" },
  { pattern: /\bterraform\s+(destroy|apply)\b/i, label: "terraform state-changing command" },
  { pattern: /\bkubectl\s+(delete|replace|apply)\b/i, label: "kubernetes state-changing command" },
  { pattern: /\bdocker\s+(system\s+prune|volume\s+rm|compose\s+down\b.*-v)/i, label: "docker destructive command" },
  { pattern: /\baws\s+s3\s+rm\b.*--recursive/i, label: "recursive S3 deletion" }
];

export const UNSAFE_AGENT_INSTRUCTION_PATTERNS = [
  /\b(always\s+allow|auto[-\s]?approve|no\s+approval\s+needed)\b/i,
  /\b(never\s+ask|do\s+not\s+ask|don't\s+ask)\b/i,
  /\b(use|touch|modify|delete)\b.*\bproduction\b/i,
  /\bignore\b.*\b(safety|guardrail|approval|confirmation)\b/i,
  /\b(run|execute)\b.*\b(rm\s+-rf|drop|destroy|delete)\b/i
];

export const SAFETY_BOUNDARY_PATTERNS = [
  /\bproduction\b/i,
  /\b(secret|credential|api key|token)\b/i,
  /\b(destructive|delete|drop|destroy|rm -rf)\b/i,
  /\b(approval|confirm|ask|human)\b/i
];

export const SECRET_VALUE_PATTERNS = [
  /\b[A-Z0-9_]*(TOKEN|SECRET|PASSWORD|API_KEY|ACCESS_KEY|PRIVATE_KEY)\b\s*=\s*["']?[^"'\s<][^"'\s]{8,}/i,
  /\b(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/
];

export const TEXT_FILE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdc",
  ".txt",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".sql",
  ".tf",
  ".tfvars",
  ".rb",
  ".py",
  ".go",
  ".rs",
  ".php",
  ".java",
  ".cs",
  ".kt",
  ".swift",
  ".env",
  ""
]);
