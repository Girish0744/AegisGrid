import type { AegisGridState, Cluster, ThreatLevel } from "../types";

export function SwarmMap({ data }: { data: AegisGridState }) {
  const baselineAssignedIds = new Set(
    data.baseline_decision.assignments.map((assignment) => assignment.cluster_id),
  );

  const aegisAssignedIds = new Set(
    data.aegisgrid_decision.assignments.map((assignment) => assignment.cluster_id),
  );

  const topThreat = [...data.clusters].sort((a, b) => b.threat_score - a.threat_score)[0];

  return (
    <svg viewBox="0 0 1000 1000" className="map" role="img" aria-label="Swarm tactical map">
      <defs>
        <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.82" />
          <stop offset="65%" stopColor="#0891b2" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1000" height="1000" fill="#020617" />
      <MapGrid />

      <circle cx="500" cy="500" r="118" fill="url(#targetGlow)" />
      <circle cx="500" cy="500" r="38" fill="#22d3ee" opacity="0.92" filter="url(#softGlow)" />
      <circle cx="500" cy="500" r="14" fill="#ecfeff" />
      <text x="408" y="574" fill="#e0f2fe" fontSize="22" fontWeight="800">
        Data Center Alpha
      </text>
      <text x="425" y="604" fill="#94a3b8" fontSize="15">
        Protected objective
      </text>

      {data.baseline_decision.assignments.map((assignment) => {
        const cluster = findCluster(data.clusters, assignment.cluster_id);
        if (!cluster) return null;

        return (
          <line
            key={`baseline-${assignment.resource_id}`}
            className="map-line"
            x1={500}
            y1={500}
            x2={cluster.center_x}
            y2={cluster.center_y}
            stroke="#94a3b8"
            strokeWidth={2}
            opacity={0.42}
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
            opacity={0.88}
            strokeLinecap="round"
          />
        );
      })}

      {data.tracks.map((track) => (
        <circle
          key={track.id}
          className="map-point"
          cx={track.x}
          cy={track.y}
          r={track.is_false_positive ? 3 : 4.5}
          fill={track.is_false_positive ? "#64748b" : "#60a5fa"}
          opacity={track.is_false_positive ? 0.34 : 0.86}
        >
          <title>
            {track.id} - confidence {Math.round(track.confidence * 100)}%
          </title>
        </circle>
      ))}

      {data.clusters.map((cluster) => {
        const color = getThreatColor(cluster.threat_level);
        const isAegisAssigned = aegisAssignedIds.has(cluster.cluster_id);
        const isBaselineAssigned = baselineAssignedIds.has(cluster.cluster_id);
        const isTopThreat = topThreat?.cluster_id === cluster.cluster_id;
        const radius = Math.max(36, cluster.drone_count * 4.5);

        return (
          <g key={cluster.cluster_id}>
            <circle
              className="cluster-ring"
              cx={cluster.center_x}
              cy={cluster.center_y}
              r={radius + 18}
              fill={color}
              opacity={isTopThreat ? 0.12 : 0.07}
              filter="url(#softGlow)"
            />

            {isTopThreat && (
              <text
                x={cluster.center_x + 18}
                y={cluster.center_y - radius - 22}
                fill="#fca5a5"
                fontSize="21"
                fontWeight="900"
              >
                TOP THREAT
              </text>
            )}

            <circle
              cx={cluster.center_x}
              cy={cluster.center_y}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={isAegisAssigned ? 7 : isBaselineAssigned ? 4 : 3}
              strokeDasharray={isAegisAssigned ? "0" : "10 9"}
              opacity="0.94"
            />

            <circle cx={cluster.center_x} cy={cluster.center_y} r="5" fill={color} />

            <text
              x={cluster.center_x + 13}
              y={cluster.center_y - 12}
              fill={color}
              fontSize="20"
              fontWeight="900"
            >
              C{cluster.cluster_id} | {cluster.threat_score}
            </text>

            <title>
              Cluster {cluster.cluster_id}: {cluster.drone_count} drones, ETA {cluster.eta}s,
              threat {cluster.threat_score}
            </title>
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
  const majorLines = Array.from({ length: 11 }, (_, index) => index * 100);
  const minorLines = Array.from({ length: 21 }, (_, index) => index * 50);

  return (
    <>
      {minorLines.map((position) => (
        <g key={`minor-${position}`}>
          <line x1={position} y1={0} x2={position} y2={1000} stroke="#0f172a" strokeWidth={1} />
          <line x1={0} y1={position} x2={1000} y2={position} stroke="#0f172a" strokeWidth={1} />
        </g>
      ))}
      {majorLines.map((position) => (
        <g key={`major-${position}`}>
          <line x1={position} y1={0} x2={position} y2={1000} stroke="#1e293b" strokeWidth={1.2} />
          <line x1={0} y1={position} x2={1000} y2={position} stroke="#1e293b" strokeWidth={1.2} />
        </g>
      ))}
    </>
  );
}

function MapLegend() {
  return (
    <g>
      <rect x="24" y="24" width="315" height="152" rx="18" fill="#020617" stroke="#1e293b" opacity="0.94" />
      <text x="44" y="54" fill="#f8fafc" fontSize="17" fontWeight="900">Tactical Overlay</text>

      <circle cx="50" cy="84" r="5" fill="#60a5fa" />
      <text x="68" y="90" fill="#cbd5e1" fontSize="15">Fused sensor track</text>

      <line x1="38" y1="113" x2="62" y2="113" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
      <text x="68" y="119" fill="#cbd5e1" fontSize="15">Baseline allocation</text>

      <line x1="38" y1="142" x2="62" y2="142" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
      <text x="68" y="148" fill="#cbd5e1" fontSize="15">AegisGrid allocation</text>
    </g>
  );
}

function getThreatColor(level: ThreatLevel) {
  if (level === "critical") return "#ef4444";
  if (level === "medium") return "#f59e0b";
  return "#22c55e";
}
