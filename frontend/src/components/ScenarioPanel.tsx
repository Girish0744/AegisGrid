import { Shield } from "lucide-react";
import type { AegisGridState } from "../types";

export function ScenarioPanel({ data }: { data: AegisGridState }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Shield size={18} />
            Scenario Telemetry
          </h2>
          <p className="panel-subtitle">Current simulation inventory and response footprint.</p>
        </div>
      </div>

      <div className="scenario-grid">
        <Stat label="Type" value={data.scenario_type ?? data.scenario ?? "unknown"} />
        <Stat label="Tracks" value={data.tracks.length} />
        <Stat label="Clusters" value={data.clusters.length} />
        <Stat label="Resources" value={data.aegisgrid_decision.assignments.length} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="scenario-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
