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

          if (!cluster) return null;

          return (
            <div className="action" key={assignment.resource_id}>
              <div className="action-main">
                <b>
                  {assignment.resource_id} to Cluster {assignment.cluster_id}
                </b>
                <span className={`threat-badge ${cluster.threat_level}`}>
                  {cluster.threat_level}
                </span>
              </div>

              <p>
                ETA {cluster.eta}s | {cluster.drone_count} drones | Strategy {assignment.strategy}
              </p>
              <p>{assignment.reason}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
