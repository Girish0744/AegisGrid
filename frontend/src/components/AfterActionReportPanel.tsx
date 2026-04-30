import { useState } from "react";
import { FileText } from "lucide-react";
import { generateAIAfterActionReport } from "../api";
import type { AegisGridState } from "../types";

export function AfterActionReportPanel({ data }: { data: AegisGridState }) {
  const report = data.ai_insights?.after_action_report;
  const [enhancedReport, setEnhancedReport] = useState(report);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!report) {
    return (
      <section className="panel">
        <h2>
          <FileText size={18} />
          After-Action Report
        </h2>
        <p className="panel-subtitle">Report unavailable.</p>
      </section>
    );
  }

  const displayReport = enhancedReport ?? report;

  async function handleGenerateAIReport() {
    try {
      setIsGenerating(true);
      const result = await generateAIAfterActionReport();
      setEnhancedReport(result.report);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="panel">
      <h2>
        <FileText size={18} />
        {displayReport.title}
      </h2>

      <button
        className="demo-button"
        type="button"
        onClick={handleGenerateAIReport}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating AI Report..." : "Generate AI Report"}
      </button>

      <div className="verdict-card">
        <strong>{displayReport.verdict}</strong>
        <span>Trust: {displayReport.trust_status}</span>
      </div>

      <p className="report-summary">{displayReport.summary}</p>

      <div className="report-section">
        <h3>Key Findings</h3>
        <ul>
          {displayReport.key_findings.map((finding) => (
            <li key={finding}>{finding}</li>
          ))}
        </ul>
      </div>

    </section>
  );
}