import type { AegisGridState } from "../types";

export function PipelineStatus({ data }: { data: AegisGridState }) {
  const stages = [
    {
      name: "Scenario",
      value: `${data.true_drones.length} drones simulated`,
      active: data.true_drones.length > 0,
    },
    {
      name: "Sensor",
      value: `${data.detections.length} detections received`,
      active: data.detections.length > 0,
    },
    {
      name: "Fusion",
      value: `${data.tracks.length} tracks fused`,
      active: data.tracks.length > 0,
    },
    {
      name: "Clustering",
      value: `${data.clusters.length} clusters identified`,
      active: data.clusters.length > 0,
    },
    {
      name: "Decision",
      value: `${data.aegisgrid_decision.assignments.length} resources allocated`,
      active: data.aegisgrid_decision.assignments.length > 0,
    },
  ];

  return (
    <section className="panel">
      <h2 className="mb-3 text-lg font-semibold text-white">System Pipeline</h2>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="flex items-center justify-between rounded-xl bg-slate-950 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold text-white">{stage.name}</p>
              <p className="text-xs text-slate-400">{stage.value}</p>
            </div>

            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                stage.active
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {stage.active ? "ACTIVE" : "WAITING"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}