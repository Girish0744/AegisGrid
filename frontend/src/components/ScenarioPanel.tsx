import { Shield } from "lucide-react";
import type { AegisGridState } from "../types";

export function ScenarioPanel({ data }: { data: AegisGridState }) {
  return (
    <section className="panel">
      <h2>
        <Shield size={18} />
        Scenario
      </h2>

      <p>
        <b>Type:</b> {data.scenario}
      </p>
      <p>
        <b>Tracks:</b> {data.tracks.length}
      </p>
      <p>
        <b>Clusters:</b> {data.clusters.length}
      </p>
      <p>
        <b>Resources:</b> {data.aegisgrid_decision.assignments.length}
      </p>
    </section>
  );
}
