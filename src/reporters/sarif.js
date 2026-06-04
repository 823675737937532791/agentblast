import { RULES } from "../rules.js";

export function renderSarif(result) {
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "AgentBlast",
            informationUri: "https://github.com/823675737937532791/agentblast",
            rules: RULES.map((rule) => ({
              id: rule.id,
              name: rule.title,
              shortDescription: { text: rule.title },
              fullDescription: { text: rule.description },
              help: { text: rule.recommendation },
              defaultConfiguration: { level: sarifLevel(rule.severity) },
              properties: { category: rule.category, severity: rule.severity }
            }))
          }
        },
        results: result.findings.map((finding) => ({
          ruleId: finding.ruleId,
          level: sarifLevel(finding.severity),
          message: {
            text: `${finding.title}: ${finding.evidence}. ${finding.recommendation}`
          },
          locations: finding.file
            ? [
                {
                  physicalLocation: {
                    artifactLocation: { uri: finding.file },
                    region: { startLine: finding.line || 1 }
                  }
                }
              ]
            : []
        }))
      }
    ]
  };
  return `${JSON.stringify(sarif, null, 2)}\n`;
}

function sarifLevel(severity) {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "note";
}
