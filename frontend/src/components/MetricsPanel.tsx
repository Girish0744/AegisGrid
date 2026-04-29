import { Activity } from "lucide-react";
import type { AegisGridState } from "../types";

export function MetricsPanel({ data }: { data: AegisGridState }) {
  const baseline = data.evaluation.baseline;
  const aegisgrid = data.evaluation.aegisgrid;

  return (
    <section className="panel">
      <h2>
        <Activity size={18} />
        Baseline vs AegisGrid
      </h2>

      <div className="compare">
        <Metric label="Baseline Risk" value={baseline.breach_risk} />
        <Metric label="AegisGrid Risk" value={aegisgrid.breach_risk} />
      </div>

      <div className="compare">
        <Metric label="Baseline Waste" value={baseline.resource_waste} />
        <Metric label="AegisGrid Waste" value={aegisgrid.resource_waste} />
      </div>

      <div className="improvement">Improvement: {data.evaluation.improvement}%</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}%</strong>
    </div>
  );
}
