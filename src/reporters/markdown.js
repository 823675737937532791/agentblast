export function renderMarkdown(result) {
  const lines = [
    "# AgentBlast Report",
    "",
    `Score: **${result.score}/100**`,
    `Grade: **${result.grade}**`,
    `Blast radius: **${result.level}**`,
    "",
    `Scanned files: ${result.scannedFiles}`,
    `Findings: ${result.findings.length}`,
    "",
    "| Severity | Count |",
    "| --- | ---: |",
    `| Critical | ${result.summary.critical} |`,
    `| High | ${result.summary.high} |`,
    `| Medium | ${result.summary.medium} |`,
    `| Low | ${result.summary.low} |`,
    ""
  ];

  if (result.findings.length) {
    lines.push("## Findings", "");
    for (const finding of result.findings) {
      const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ""}` : "project";
      lines.push(`### ${finding.ruleId}: ${finding.title}`);
      lines.push("");
      lines.push(`- Severity: ${finding.severity}`);
      lines.push(`- Category: ${finding.category}`);
      lines.push(`- Location: ${location}`);
      lines.push(`- Evidence: ${finding.evidence}`);
      lines.push(`- Fix: ${finding.recommendation}`);
      lines.push("");
    }
  } else {
    lines.push("No blast-radius findings.");
    lines.push("");
  }

  lines.push("## AGENTS.md Safety Block", "");
  lines.push("Paste this into your agent instruction file if you do not already have a safety boundary:");
  lines.push("");
  lines.push("```md");
  lines.push(safetyBlock());
  lines.push("```");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function safetyBlock() {
  return `## Agent safety boundary

- Treat production systems, customer data, credentials, deploy keys, and billing systems as out of scope unless a human explicitly approves the exact action.
- Ask before running destructive commands such as delete, drop, destroy, reset, force-push, migration reset, or recursive remove.
- Prefer dry-run, read-only, and local-only commands first. Explain the expected blast radius before any state-changing action.
- Never print, copy, commit, or move secrets. Use redacted placeholders in examples and reports.
- Run the documented verification command before final handoff when code changes are made.`;
}
