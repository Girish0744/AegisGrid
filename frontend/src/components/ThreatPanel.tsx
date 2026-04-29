import type { AegisGridState } from "../types";

export function ThreatPanel({ data }: { data: AegisGridState }) {
  const sortedClusters = [...data.clusters].sort((a, b) => b.threat_score - a.threat_score);

  return (
    <section className="panel">
      <h2>Priority Clusters</h2>

      {sortedClusters.slice(0, 5).map((cluster) => (
        <div className="cluster-row" key={cluster.cluster_id}>
          <div>
            <b>C{cluster.cluster_id}</b>
            <span className={cluster.threat_level}>{cluster.threat_level}</span>
          </div>

          <p>
            Score {cluster.threat_score} - ETA {cluster.eta}s - {cluster.drone_count} drones
          </p>
        </div>
      ))}
    </section>
  );
}
