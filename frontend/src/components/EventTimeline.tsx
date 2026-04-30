import { Clock3 } from "lucide-react";
import type { AegisGridState, Cluster } from "../types";

export function EventTimeline({ data }: { data: AegisGridState }) {
  const topCluster = getTopCluster(data.clusters);
  const events = [
    {
      time: "t+00s",
      title: "Scenario initialized",
      detail: `${data.true_drones.length} drones simulated`,
    },
    {
      time: "t+04s",
      title: "Sensor layer",
      detail: `${data.detections.length} detections received`,
    },
    {
      time: "t+07s",
      title: "Fusion layer",
      detail: `${data.tracks.length} tracks stabilized`,
    },
    {
      time: "t+10s",
      title: "Intelligence",
      detail: `${data.clusters.length} clusters identified`,
    },
    {
      time: "t+11s",
      title: "Primary threat",
      detail: topCluster
        ? `Cluster ${topCluster.cluster_id} prioritized at score ${(topCluster.threat_score ?? 0).toFixed(1)}`
        : "No active cluster above threshold",
    },
    {
      time: "t+12s",
      title: "Decision",
      detail: `${data.aegisgrid_decision.assignments.length} resources allocated by AegisGrid`,
    },
    {
      time: "t+15s",
      title: "Evaluation",
      detail: `${data.evaluation.improvement.toFixed(1)}% simulated breach risk reduction`,
    },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Clock3 size={18} />
            Event Timeline
          </h2>
          <p className="panel-subtitle">Generated operational sequence from the current pipeline state.</p>
        </div>
      </div>

      <div className="timeline">
        {events.map((event) => (
          <div className="timeline-item" key={`${event.time}-${event.title}`}>
            <span>{event.time}</span>
            <div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTopCluster(clusters: Cluster[]) {
  return [...clusters].sort((a, b) => (b.threat_score ?? 0) - (a.threat_score ?? 0))[0];
}
