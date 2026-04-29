import { Activity, ShieldCheck, TrendingUp } from "lucide-react";
import type { AegisGridState } from "../types";

export function MetricsPanel({ data }: { data: AegisGridState }) {
  const baseline = data.evaluation.baseline;
  const aegisgrid = data.evaluation.aegisgrid;
  const improvement = data.evaluation.improvement;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Activity size={18} />
            Decision Metrics
          </h2>
          <p className="panel-subtitle">Baseline strategy compared with optimized allocation.</p>
        </div>
        <TrendingUp size={18} color="#67e8f9" />
      </div>

      <div className="metric-grid">
        <Metric label="Baseline Risk" value={baseline.breach_risk} tone="red" />
        <Metric label="AegisGrid Risk" value={aegisgrid.breach_risk} tone="green" />
        <Metric label="Resource Waste" value={aegisgrid.resource_waste} tone="cyan" />
        <Metric label="Efficiency" value={aegisgrid.response_efficiency} tone="green" />
      </div>

      <div className="improvement">
        <ShieldCheck size={17} />
        Improvement: {improvement.toFixed(2)}%
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
  value: number;
  tone: "green" | "red" | "cyan";
}) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value.toFixed(1)}%</strong>
      <div className="progress-track">
        <div className={`progress-fill ${tone}`} style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}
