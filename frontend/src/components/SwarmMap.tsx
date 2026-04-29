// import type { AegisGridState, ThreatLevel } from "../types";

// export function SwarmMap({ data }: { data: AegisGridState }) {
//   const assignedClusterIds = new Set(
//     data.aegisgrid_decision.assignments.map((assignment) => assignment.cluster_id),
//   );

//   return (
//     <svg viewBox="0 0 1000 1000" className="map" role="img" aria-label="Swarm tactical map">
//       <rect width="1000" height="1000" fill="#020617" />
//       <circle cx="500" cy="500" r="44" fill="#38bdf8" opacity="0.95" />
//       <text x="410" y="570" fill="#e0f2fe" fontSize="22" fontWeight="bold">
//         Data Center Alpha
//       </text>

//       {data.tracks.map((track) => (
//         <circle
//           key={track.id}
//           cx={track.x}
//           cy={track.y}
//           r={track.is_false_positive ? 3 : 4}
//           fill={track.is_false_positive ? "#64748b" : "#60a5fa"}
//           opacity={track.is_false_positive ? 0.35 : 0.9}
//         />
//       ))}

//       {data.clusters.map((cluster) => {
//         const color = getThreatColor(cluster.threat_level);
//         const isAssigned = assignedClusterIds.has(cluster.cluster_id);

//         return (
//           <g key={cluster.cluster_id}>
//             <circle
//               cx={cluster.center_x}
//               cy={cluster.center_y}
//               r={Math.max(34, cluster.drone_count * 4)}
//               fill="none"
//               stroke={color}
//               strokeWidth={isAssigned ? 6 : 3}
//               strokeDasharray={isAssigned ? "0" : "9 9"}
//               opacity="0.92"
//             />

//             <text
//               x={cluster.center_x + 12}
//               y={cluster.center_y - 12}
//               fill={color}
//               fontSize="20"
//               fontWeight="bold"
//             >
//               C{cluster.cluster_id} - {cluster.threat_score}
//             </text>
//           </g>
//         );
//       })}
//     </svg>
//   );
// }

// function getThreatColor(level: ThreatLevel) {
//   if (level === "critical") return "#ef4444";
//   if (level === "medium") return "#f59e0b";
//   return "#22c55e";
// }

import type { AegisGridState, Cluster, ThreatLevel } from "../types";

export function SwarmMap({ data }: { data: AegisGridState }) {
  const baselineAssignedIds = new Set(
    data.baseline_decision.assignments.map((assignment) => assignment.cluster_id),
  );

  const aegisAssignedIds = new Set(
    data.aegisgrid_decision.assignments.map((assignment) => assignment.cluster_id),
  );

  const topThreat = [...data.clusters].sort(
    (a, b) => b.threat_score - a.threat_score,
  )[0];

  return (
    <svg viewBox="0 0 1000 1000" className="map" role="img" aria-label="Swarm tactical map">
      <rect width="1000" height="1000" fill="#020617" />

      <MapGrid />

      <circle cx="500" cy="500" r="48" fill="#38bdf8" opacity="0.2" />
      <circle cx="500" cy="500" r="34" fill="#38bdf8" opacity="0.95" />
      <text x="410" y="570" fill="#e0f2fe" fontSize="22" fontWeight="bold">
        Data Center Alpha
      </text>

      {data.baseline_decision.assignments.map((assignment) => {
        const cluster = findCluster(data.clusters, assignment.cluster_id);
        if (!cluster) return null;

        return (
          <line
            key={`baseline-${assignment.resource_id}`}
            x1={500}
            y1={500}
            x2={cluster.center_x}
            y2={cluster.center_y}
            stroke="#94a3b8"
            strokeWidth={3}
            strokeDasharray="8 8"
            opacity={0.6}
          />
        );
      })}

      {data.aegisgrid_decision.assignments.map((assignment) => {
        const cluster = findCluster(data.clusters, assignment.cluster_id);
        if (!cluster) return null;

        return (
          <line
            key={`aegis-${assignment.resource_id}`}
            x1={500}
            y1={500}
            x2={cluster.center_x}
            y2={cluster.center_y}
            stroke="#22c55e"
            strokeWidth={4}
            opacity={0.9}
          />
        );
      })}

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
        const isAegisAssigned = aegisAssignedIds.has(cluster.cluster_id);
        const isBaselineAssigned = baselineAssignedIds.has(cluster.cluster_id);
        const isTopThreat = topThreat?.cluster_id === cluster.cluster_id;

        return (
          <g key={cluster.cluster_id}>
            {isTopThreat && (
              <>
                <circle
                  cx={cluster.center_x}
                  cy={cluster.center_y}
                  r={Math.max(70, cluster.drone_count * 5.5)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={7}
                  opacity="0.45"
                />

                <text
                  x={cluster.center_x + 18}
                  y={cluster.center_y - 36}
                  fill="#ef4444"
                  fontSize="22"
                  fontWeight="bold"
                >
                  TOP THREAT
                </text>
              </>
            )}

            <circle
              cx={cluster.center_x}
              cy={cluster.center_y}
              r={Math.max(34, cluster.drone_count * 4)}
              fill="none"
              stroke={color}
              strokeWidth={isAegisAssigned ? 6 : isBaselineAssigned ? 4 : 3}
              strokeDasharray={isAegisAssigned ? "0" : "9 9"}
              opacity="0.92"
            />

            <text
              x={cluster.center_x + 12}
              y={cluster.center_y - 12}
              fill={color}
              fontSize="20"
              fontWeight="bold"
            >
              C{cluster.cluster_id} · {cluster.threat_score}
            </text>
          </g>
        );
      })}

      <MapLegend />
    </svg>
  );
}

function findCluster(clusters: Cluster[], clusterId: number) {
  return clusters.find((cluster) => cluster.cluster_id === clusterId);
}

function MapGrid() {
  const lines = Array.from({ length: 11 }, (_, index) => index * 100);

  return (
    <>
      {lines.map((position) => (
        <g key={position}>
          <line x1={position} y1={0} x2={position} y2={1000} stroke="#1e293b" strokeWidth={1} />
          <line x1={0} y1={position} x2={1000} y2={position} stroke="#1e293b" strokeWidth={1} />
        </g>
      ))}
    </>
  );
}

function MapLegend() {
  return (
    <g>
      <rect x="24" y="24" width="300" height="142" rx="12" fill="#020617" stroke="#1e293b" />
      <circle cx="48" cy="52" r="5" fill="#60a5fa" />
      <text x="66" y="58" fill="#cbd5e1" fontSize="16">Fused sensor track</text>

      <line x1="36" y1="82" x2="58" y2="82" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
      <text x="66" y="88" fill="#cbd5e1" fontSize="16">Baseline allocation</text>

      <line x1="36" y1="112" x2="58" y2="112" stroke="#22c55e" strokeWidth="4" />
      <text x="66" y="118" fill="#cbd5e1" fontSize="16">AegisGrid allocation</text>

      <circle cx="48" cy="146" r="7" fill="none" stroke="#ef4444" strokeWidth="3" />
      <text x="66" y="152" fill="#fca5a5" fontSize="16">Top threat cluster</text>

    </g>
  );
}

function getThreatColor(level: ThreatLevel) {
  if (level === "critical") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#22c55e";
}