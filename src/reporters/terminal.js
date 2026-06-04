const COLORS = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  green: "\u001b[32m",
  magenta: "\u001b[35m"
};

const SEVERITY_COLOR = {
  critical: COLORS.red,
  high: COLORS.red,
  medium: COLORS.yellow,
  low: COLORS.blue
};

export function renderTerminal(result) {
  const color = result.score >= 80 ? COLORS.green : result.score >= 65 ? COLORS.yellow : COLORS.red;
  const lines = [
    `${COLORS.bold}AgentBlast${COLORS.reset} ${COLORS.dim}${result.root}${COLORS.reset}`,
    "",
    `${color}${result.score}/100${COLORS.reset}  grade ${COLORS.bold}${result.grade}${COLORS.reset}  ${result.level}`,
    `files ${result.scannedFiles}  findings ${result.findings.length}  duration ${result.durationMs}ms`,
    `critical ${result.summary.critical}  high ${result.summary.high}  medium ${result.summary.medium}  low ${result.summary.low}`,
    ""
  ];

  if (result.findings.length === 0) {
    lines.push(`${COLORS.green}No blast-radius findings. Nice and boring.${COLORS.reset}`);
    return lines.join("\n");
  }

  for (const finding of result.findings) {
    const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ""}` : "project";
    const colorForSeverity = SEVERITY_COLOR[finding.severity] || "";
    lines.push(`${colorForSeverity}${finding.severity.toUpperCase()}${COLORS.reset} ${finding.ruleId} ${finding.title}`);
    lines.push(`  ${COLORS.dim}${location}${COLORS.reset}  ${finding.evidence}`);
    lines.push(`  fix: ${finding.recommendation}`);
  }

  lines.push("");
  lines.push(`${COLORS.dim}Tip: generate CI output with --format sarif --out agentblast.sarif --fail-on high${COLORS.reset}`);
  return lines.join("\n");
}
