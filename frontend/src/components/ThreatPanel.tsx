import { Crosshair } from "lucide-react";
import type { AegisGridState, ThreatLevel } from "../types";

export function ThreatPanel({ data }: { data: AegisGridState }) {
  const sortedClusters = [...data.clusters].sort((a, b) => b.threat_score - a.threat_score);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Crosshair size={18} />
            Threat Matrix
          </h2>
          <p className="panel-subtitle">Clusters ranked by score, ETA, and observed swarm size.</p>
        </div>
      </div>

      <div className="threat-list">
        {sortedClusters.slice(0, 5).map((cluster, index) => (
          <div
            className={`cluster-row ${index === 0 ? "top-threat" : ""}`}
            key={cluster.cluster_id}
          >
            <div className="cluster-main">
              <b>{index === 0 ? "TOP THREAT" : `Cluster ${cluster.cluster_id}`}</b>
              <span className={`threat-badge ${cluster.threat_level}`}>
                {getThreatLabel(cluster.threat_level)}
              </span>
            </div>

            <div className="cluster-meta">
              <span>Score {cluster.threat_score}</span>
              <span>ETA {cluster.eta}s</span>
              <span>{cluster.drone_count} drones</span>
              <span>{Math.round(cluster.decoy_ratio * 100)}% decoy ratio</span>
            </div>

            <div className="cluster-score">
              <div className="progress-track">
                <div
                  className={`progress-fill ${cluster.threat_level === "critical" ? "red" : "green"}`}
                  style={{ width: `${Math.max(6, Math.min(100, cluster.threat_score))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getThreatLabel(level: ThreatLevel) {
  if (level === "critical") return "High";
  if (level === "medium") return "Medium";
  return "Low";
}
