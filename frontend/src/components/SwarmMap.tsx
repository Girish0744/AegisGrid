import type { AegisGridState, ThreatLevel } from "../types";

export function SwarmMap({ data }: { data: AegisGridState }) {
  const assignedClusterIds = new Set(
    data.aegisgrid_decision.assignments.map((assignment) => assignment.cluster_id),
  );

  return (
    <svg viewBox="0 0 1000 1000" className="map" role="img" aria-label="Swarm tactical map">
      <rect width="1000" height="1000" fill="#020617" />
      <circle cx="500" cy="500" r="44" fill="#38bdf8" opacity="0.95" />
      <text x="410" y="570" fill="#e0f2fe" fontSize="22" fontWeight="bold">
        Data Center Alpha
      </text>

      {data.tracks.map((track) => (
        <circle
          key={track.id}
          cx={track.x}
          cy={track.y}
          r={track.is_false_positive ? 3 : 4}
          fill={track.is_false_positive ? "#64748b" : "#60a5fa"}
          opacity={track.is_false_positive ? 0.35 : 0.9}
        />
      ))}

      {data.clusters.map((cluster) => {
        const color = getThreatColor(cluster.threat_level);
        const isAssigned = assignedClusterIds.has(cluster.cluster_id);

        return (
          <g key={cluster.cluster_id}>
            <circle
              cx={cluster.center_x}
              cy={cluster.center_y}
              r={Math.max(34, cluster.drone_count * 4)}
              fill="none"
              stroke={color}
              strokeWidth={isAssigned ? 6 : 3}
              strokeDasharray={isAssigned ? "0" : "9 9"}
              opacity="0.92"
            />

            <text
              x={cluster.center_x + 12}
              y={cluster.center_y - 12}
              fill={color}
              fontSize="20"
              fontWeight="bold"
            >
              C{cluster.cluster_id} - {cluster.threat_score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function getThreatColor(level: ThreatLevel) {
  if (level === "critical") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#22c55e";
}
