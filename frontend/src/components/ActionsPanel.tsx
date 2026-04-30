import { Route } from "lucide-react";
import type { AegisGridState } from "../types";

export function ActionsPanel({ data }: { data: AegisGridState }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Route size={18} />
            Recommended Allocation
          </h2>
          <p className="panel-subtitle">AegisGrid response plan by resource and target cluster.</p>
        </div>
      </div>

      <div className="action-list">
        {data.aegisgrid_decision.assignments.map((assignment) => {
          const cluster = data.clusters.find(
            (candidate) => candidate.cluster_id === assignment.cluster_id,
          );
          const threatLevel = cluster?.threat_level ?? "low";
          const eta = cluster?.eta;
          const droneCount = cluster?.drone_count;
          const threatScore = cluster?.threat_score;

          return (
            <div className="action" key={assignment.resource_id}>
              <div className="action-main">
                <b>
                  {assignment.resource_id} to Cluster {assignment.cluster_id}
                </b>
                <span className={`threat-badge ${threatLevel}`}>{threatLevel}</span>
              </div>

              <p>
                {eta !== undefined ? `ETA ${eta.toFixed(1)}s` : "ETA unavailable"} |{" "}
                {droneCount !== undefined ? `${droneCount} drones` : "size unavailable"} |{" "}
                {threatScore !== undefined
                  ? `Threat score ${threatScore.toFixed(1)}`
                  : "threat score unavailable"}
              </p>
              <p>Reason: {assignment.reason}</p>
              <p className="action-warning">
                If ignored: this cluster remains one of the highest contributors to breach risk.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
