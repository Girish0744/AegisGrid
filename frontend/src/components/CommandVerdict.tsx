import { ShieldAlert } from "lucide-react";
import type { AegisGridState } from "../types";

export function CommandVerdict({ data }: { data: AegisGridState }) {
  const improvement = data.evaluation.improvement;
  const breachRisk = data.evaluation.aegisgrid.breach_risk;
  const criticalClusters = data.clusters.filter((cluster) => cluster.threat_level === "critical").length;
  const assignments = data.aegisgrid_decision.assignments.length;
  const verdict = classifyVerdict(breachRisk, improvement);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <ShieldAlert size={18} />
            Command Verdict
          </h2>
          <p className="panel-subtitle">Operational status for higher-authority review.</p>
        </div>
      </div>

      <div className={`verdict-card ${verdict.tone}`}>
        <strong>{data.report?.verdict ?? verdict.label}</strong>
        <p>{verdict.explanation}</p>
      </div>

      <div className="command-facts">
        <span>{criticalClusters} critical cluster{criticalClusters === 1 ? "" : "s"}</span>
        <span>{assignments} resources assigned</span>
      </div>

      <div className="alert-box">
        <strong>Recommended next step</strong>
        <p>{verdict.nextStep}</p>
      </div>
    </section>
  );
}

function classifyVerdict(breachRisk: number, improvement: number) {
  if (breachRisk <= 35 && improvement >= 20) {
    return {
      label: "BREACH RISK CONTAINED",
      tone: "status-contained",
      explanation: "AegisGrid has reduced the projected breach risk to a controlled level.",
      nextStep: "Maintain tracking, preserve reserve capacity, and continue sensor confirmation.",
    };
  }

  if (breachRisk <= 55) {
    return {
      label: "PARTIAL CONTAINMENT",
      tone: "status-warning",
      explanation:
        "AegisGrid reduced risk, but remaining breach risk is still elevated under current resources.",
      nextStep: "Recommend additional response resources or sensor coverage expansion.",
    };
  }

  return {
    label: "HIGH RISK - ADDITIONAL RESOURCES REQUIRED",
    tone: "status-danger",
    explanation: "Projected breach risk remains high after optimized allocation.",
    nextStep: "Escalate resource request and prioritize sensor coverage on the highest-risk cluster.",
  };
}
