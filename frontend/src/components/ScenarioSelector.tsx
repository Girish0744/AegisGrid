import { SlidersHorizontal } from "lucide-react";

type Props = {
  scenario: string;
  onChange: (scenario: string) => void;
};

export function ScenarioSelector({ scenario, onChange }: Props) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <SlidersHorizontal size={18} />
            Scenario Controls
          </h2>
          <p className="panel-subtitle">Switch simulation profiles without changing API wiring.</p>
        </div>
      </div>

      <select
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
