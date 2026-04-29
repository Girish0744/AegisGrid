import { RadioTower } from "lucide-react";
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
      <div className="panel-header">
        <div>
          <h2>
            <RadioTower size={18} />
            System Pipeline
          </h2>
          <p className="panel-subtitle">Live progression from simulation to response.</p>
        </div>
      </div>

      <div className="pipeline">
        {stages.map((stage, index) => (
          <div key={stage.name} className={`pipeline-step ${stage.active ? "active" : ""}`}>
            <div className="step-index">{index + 1}</div>
            <div className="step-copy">
              <strong>{stage.name}</strong>
              <p>{stage.value}</p>
            </div>
            <span className="step-state">{stage.active ? "ACTIVE" : "WAIT"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
