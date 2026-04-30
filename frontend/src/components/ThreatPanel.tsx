import { Crosshair } from "lucide-react";
import type { AegisGridState, ThreatLevel } from "../types";

export function ThreatPanel({ data }: { data: AegisGridState }) {
  const sortedClusters = [...data.clusters].sort(
    (a, b) => (b.threat_score ?? 0) - (a.threat_score ?? 0),
  );

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
              <span className={`threat-badge ${cluster.threat_level ?? "low"}`}>
                {getThreatLabel(cluster.threat_level ?? "low")}
              </span>
            </div>

            <div className="cluster-meta">
              <span>Score {(cluster.threat_score ?? 0).toFixed(1)}</span>
              <span>ETA {cluster.eta !== undefined ? `${cluster.eta.toFixed(1)}s` : "unknown"}</span>
              <span>{cluster.drone_count ?? 0} drones</span>
              <span>Avg speed {cluster.avg_speed !== undefined ? cluster.avg_speed.toFixed(1) : "n/a"}</span>
              <span>
                Confidence{" "}
                {cluster.avg_confidence !== undefined
                  ? `${Math.round(cluster.avg_confidence * 100)}%`
                  : "n/a"}
              </span>
            </div>
            <p className="validation-note">
              Simulation validation signal: decoy {Math.round((cluster.decoy_ratio ?? 0) * 100)}% |
              false positive {Math.round((cluster.false_positive_ratio ?? 0) * 100)}%
            </p>

            <div className="cluster-score">
              <div className="progress-track">
                <div
                  className={`progress-fill ${cluster.threat_level === "critical" ? "red" : "green"}`}
                  style={{ width: `${Math.max(6, Math.min(100, cluster.threat_score ?? 0))}%` }}
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
