import { ClipboardCheck } from "lucide-react";
import type { AegisGridState } from "../types";

export function OutcomeSummary({ data }: { data: AegisGridState }) {
  const baseline = data.evaluation.baseline;
  const aegisgrid = data.evaluation.aegisgrid;
  const improvement = data.evaluation.improvement;
  const efficiencyDelta = aegisgrid.response_efficiency - baseline.response_efficiency;
  const classification = classifyOutcome(improvement);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <ClipboardCheck size={18} />
            After-Action Outcome
          </h2>
          <p className="panel-subtitle">Command-level comparison of baseline and AegisGrid allocation.</p>
        </div>
      </div>

      <div className="verdict-card status-contained">
        <strong>{classification}</strong>
        <p>
          AegisGrid reduced simulated breach risk by {improvement.toFixed(1)}% compared with the
          baseline allocation strategy.
        </p>
      </div>

      <div className="summary-grid">
        <Metric label="Baseline risk" value={`${baseline.breach_risk.toFixed(1)}%`} tone="red" />
        <Metric label="AegisGrid risk" value={`${aegisgrid.breach_risk.toFixed(1)}%`} tone="green" />
        <Metric label="Baseline waste" value={`${baseline.resource_waste.toFixed(1)}%`} />
        <Metric label="AegisGrid waste" value={`${aegisgrid.resource_waste.toFixed(1)}%`} />
        <Metric label="Efficiency delta" value={`${formatSigned(efficiencyDelta)}%`} tone={efficiencyDelta >= 0 ? "green" : "red"} />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  return (
    <div className={`summary-card ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function classifyOutcome(improvement: number) {
  if (improvement >= 25) return "SIGNIFICANT RISK REDUCTION";
  if (improvement >= 10) return "MODERATE RISK REDUCTION";
  if (improvement > 0) return "LIMITED RISK REDUCTION";
  return "NO MEASURABLE ADVANTAGE";
}

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}
