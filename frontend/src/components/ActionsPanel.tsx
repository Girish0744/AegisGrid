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
          <p className="panel-subtitle">
            Recommendations are stabilized to avoid rapid re-tasking during live review.
          </p>
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
          const statusLabel = getAssignmentStatusLabel(assignment.status);
          const secondsRemaining = assignment.seconds_remaining_estimate;

          return (
            <div className="action" key={assignment.resource_id}>
              <div className="action-main">
                <b>
                  {assignment.resource_id} to Cluster {assignment.cluster_id}
                </b>
                <div className="action-badges">
                  {statusLabel && (
                    <span className={`action-status ${assignment.status ?? "updated"}`}>
                      {statusLabel}
                    </span>
                  )}
                  <span className={`threat-badge ${threatLevel}`}>{threatLevel}</span>
                </div>
              </div>

              <p>
                {eta !== undefined ? `ETA ${eta.toFixed(1)}s` : "ETA unavailable"} |{" "}
                {droneCount !== undefined ? `${droneCount} drones` : "size unavailable"} |{" "}
                {threatScore !== undefined
                  ? `Threat score ${threatScore.toFixed(1)}`
                  : "threat score unavailable"}
              </p>
              {secondsRemaining !== undefined && (
                <p className="action-hold">
                  {assignment.status === "held" ? "Held for review" : "Recommendation lock active"} ·{" "}
                  reassessing in {secondsRemaining.toFixed(1)}s
                </p>
              )}
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

function getAssignmentStatusLabel(status?: string) {
  if (status === "held") return "HELD";
  if (status === "switched" || status === "updated") return "UPDATED";
  return "";
}
