import { SlidersHorizontal } from "lucide-react";

type Props = {
  scenario: string;
  onChange: (scenario: string) => void;
  compact?: boolean;
};

export function ScenarioSelector({ scenario, onChange, compact = false }: Props) {
  return (
    <section className={`panel scenario-selector ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="panel-header">
          <div>
            <h2>
              <SlidersHorizontal size={18} />
              Scenario Controls
            </h2>
            <p className="panel-subtitle">Switch simulation profiles without changing API wiring.</p>
          </div>
        </div>
      )}

      {compact && (
        <label className="scenario-selector-label" htmlFor="scenario-select">
          <SlidersHorizontal size={15} />
          Scenario
        </label>
      )}

      <select
        id="scenario-select"
        value={scenario}
        onChange={(event) => onChange(event.target.value)}
        className="select-field"
      >
        <option value="balanced">Balanced Swarm</option>
        <option value="decoy_heavy">Decoy Heavy</option>
        <option value="split_attack">Split Attack</option>
      </select>
    </section>
  );
}
