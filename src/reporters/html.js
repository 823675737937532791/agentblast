function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderHtml(result) {
  const rows = result.findings.map((finding) => {
    const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ""}` : "project";
    return `<tr>
      <td><span class="sev ${finding.severity}">${finding.severity}</span></td>
      <td>${escapeHtml(finding.ruleId)}</td>
      <td>${escapeHtml(finding.title)}</td>
      <td>${escapeHtml(location)}</td>
      <td>${escapeHtml(finding.recommendation)}</td>
    </tr>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AgentBlast Report</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #f6f7f9; color: #16181d; }
    main { max-width: 1120px; margin: 0 auto; padding: 40px 20px; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; border-bottom: 1px solid #d9dde5; padding-bottom: 22px; }
    h1 { font-size: 34px; line-height: 1.05; margin: 0; letter-spacing: 0; }
    .subtitle { color: #5f6673; margin: 8px 0 0; }
    .score { text-align: right; }
    .score strong { font-size: 48px; line-height: 1; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .metric { background: #fff; border: 1px solid #dfe3ea; border-radius: 8px; padding: 16px; }
    .metric span { color: #687181; font-size: 13px; }
    .metric strong { display: block; font-size: 26px; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #dfe3ea; border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e8ebf0; vertical-align: top; font-size: 14px; }
    th { color: #5f6673; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
    .sev { display: inline-block; min-width: 68px; text-align: center; border-radius: 999px; padding: 4px 8px; font-weight: 700; font-size: 12px; }
    .critical, .high { background: #ffe1df; color: #9d1c12; }
    .medium { background: #fff0c2; color: #755200; }
    .low { background: #dfeeff; color: #174b82; }
    @media (prefers-color-scheme: dark) {
      body { background: #101217; color: #eff2f7; }
      header { border-color: #2b303b; }
      .subtitle { color: #aab2c1; }
      .metric, table { background: #171a21; border-color: #2b303b; }
      th, td { border-color: #2b303b; }
      .metric span, th { color: #aab2c1; }
    }
    @media (max-width: 760px) {
      header { display: block; }
      .score { text-align: left; margin-top: 18px; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      th:nth-child(4), td:nth-child(4), th:nth-child(5), td:nth-child(5) { display: none; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>AgentBlast Report</h1>
        <p class="subtitle">Blast-radius scan for ${escapeHtml(result.root)}</p>
      </div>
      <div class="score">
        <strong>${result.score}</strong>/100
        <div>Grade ${escapeHtml(result.grade)} - ${escapeHtml(result.level)}</div>
      </div>
    </header>
    <section class="grid" aria-label="Summary">
      <div class="metric"><span>Critical</span><strong>${result.summary.critical}</strong></div>
      <div class="metric"><span>High</span><strong>${result.summary.high}</strong></div>
      <div class="metric"><span>Medium</span><strong>${result.summary.medium}</strong></div>
      <div class="metric"><span>Low</span><strong>${result.summary.low}</strong></div>
    </section>
    <table>
      <thead>
        <tr><th>Severity</th><th>Rule</th><th>Finding</th><th>Location</th><th>Fix</th></tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5">No findings.</td></tr>'}
      </tbody>
    </table>
  </main>
</body>
</html>
`;
}
