type Props = {
  scenario: string;
  onChange: (scenario: string) => void;
};

export function ScenarioSelector({ scenario, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Scenario
      </label>

      <select
        value={scenario}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white outline-none"
      >
        <option value="balanced">Balanced Swarm</option>
        <option value="decoy_heavy">Decoy Heavy</option>
        <option value="split_attack">Split Attack</option>
      </select>
    </section>
  );
}