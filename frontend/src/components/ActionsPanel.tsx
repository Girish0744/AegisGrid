import type { AegisGridState } from "../types";

export function ActionsPanel({ data }: { data: AegisGridState }) {
  return (
    <section className="panel">
      <h2>Recommended Allocation</h2>

      {data.aegisgrid_decision.assignments.map((assignment) => (
        <div className="action" key={assignment.resource_id}>
          <b>{assignment.resource_id}</b> to Cluster {assignment.cluster_id}
          <p>{assignment.reason}</p>
        </div>
      ))}
    </section>
  );
}
