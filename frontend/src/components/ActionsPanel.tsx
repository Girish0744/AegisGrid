import type { AegisGridState } from "../types";

export function ActionsPanel({ data }: { data: AegisGridState }) {
  return (
    <section className="panel">
      <h2>Recommended Allocation</h2>

      {data.aegisgrid_decision.assignments.map((assignment) => {
        const cluster = data.clusters.find(
          (cluster) => cluster.cluster_id === assignment.cluster_id
        );

        if (!cluster) return null;

        return (
          <div className="action" key={assignment.resource_id}>
            <b>
              {assignment.resource_id} → Cluster {assignment.cluster_id}
            </b>

            <p>
              Priority: {cluster.threat_level.toUpperCase()} · ETA:{" "}
              {cluster.eta}s · {cluster.drone_count} drones
            </p>

            <p>{assignment.reason}</p>
          </div>
        );
      })}
    </section>
  );
}