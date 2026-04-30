import { FileText } from "lucide-react";
import type { AegisGridState } from "../types";

export function ScenarioNarrative({ data }: { data: AegisGridState }) {
  const topThreat = [...data.clusters].sort(
    (a, b) => (b.threat_score ?? 0) - (a.threat_score ?? 0),
  )[0];
  const improvement = data.evaluation?.improvement ?? 0;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <FileText size={18} />
            Mission Narrative
          </h2>
          <p className="panel-subtitle">
            Live interpretation of sensor noise, cluster behavior, and decision impact.
          </p>
        </div>
      </div>

      {topThreat && (
        <div className="alert-box red">
          <strong>Primary threat cluster identified</strong>
          <p>
            Cluster {topThreat.cluster_id} contains {topThreat.drone_count ?? 0} drones, has an ETA
            of {topThreat.eta ?? "unknown"}s, and is rated {(topThreat.threat_level ?? "low").toUpperCase()}.
          </p>
        </div>
      )}

      <div className="alert-box green">
        <strong>Decision impact</strong>
        <p>
          AegisGrid is currently reducing simulated breach risk by {improvement.toFixed(2)}%
          compared to the baseline strategy.
        </p>
      </div>

      <p className="safety-note">
        Simulation-only decision support. No offensive capabilities, weapons control, or autonomous engagement.
      </p>
    </section>
  );
}
