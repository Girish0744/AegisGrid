import type { AegisGridState } from "../types";

export function ScenarioNarrative({ data }: { data: AegisGridState }) {
  const topThreat = [...data.clusters].sort(
    (a, b) => b.threat_score - a.threat_score
  )[0];

  const improvement = data.evaluation?.improvement ?? 0;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-2 text-lg font-semibold text-white">
        Mission Narrative
      </h2>

      <p className="text-sm text-slate-300">
        AegisGrid is analyzing noisy sensor detections, grouping swarm behavior,
        and comparing naive allocation against optimized response planning.
      </p>

      {topThreat && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm font-semibold text-red-300">
            Primary threat cluster identified
          </p>
          <p className="text-sm text-slate-300">
            Cluster {topThreat.cluster_id} contains {topThreat.drone_count} drones,
            has an ETA of {topThreat.eta}s, and is rated{" "}
            {topThreat.threat_level.toUpperCase()}.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
        <p className="text-sm font-semibold text-emerald-300">
          Decision impact
        </p>
        <p className="text-sm text-slate-300">
          AegisGrid is currently reducing simulated breach risk by{" "}
          {improvement.toFixed(2)}% compared to the baseline strategy.
        </p>
      </div>
    </section>
  );
}