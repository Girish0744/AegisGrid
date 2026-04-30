import { BrainCircuit } from "lucide-react";
import type { AegisGridState } from "../types";

export function MissionSummaryPanel({ data }: { data: AegisGridState }) {
  const mission = data.ai_insights?.mission_summary;

  if (!mission) {
    return (
      <section className="panel">
        <h2>
          <BrainCircuit size={18} />
          AI Mission Summary
        </h2>
        <p className="panel-subtitle">Mission summary unavailable.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>
        <BrainCircuit size={18} />
        AI Mission Summary
      </h2>

      <p className="mission-summary-text">{mission.summary}</p>

      <div className="mission-impact">
        <strong>Impact</strong>
        <p>{mission.impact}</p>
      </div>

      <span className="trust-badge">
        Trust: {mission.trust_status} · Detection Rate:{" "}
        {mission.detection_rate.toFixed(1)}%
      </span>
    </section>
  );
}