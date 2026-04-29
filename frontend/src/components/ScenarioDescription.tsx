type Props = {
  scenario: string;
};

const scenarioDetails: Record<string, { title: string; description: string; tests: string }> = {
  balanced: {
    title: "Balanced Swarm",
    description: "A mixed swarm with direct attackers and decoys distributed across the map.",
    tests: "Tests general swarm clustering and threat prioritization.",
  },
  decoy_heavy: {
    title: "Decoy Heavy",
    description: "A scenario with more misleading drones and noisy observations.",
    tests: "Tests whether AegisGrid avoids wasting resources under ambiguity.",
  },
  split_attack: {
    title: "Split Attack",
    description: "Multiple swarm groups approach from different directions.",
    tests: "Tests multi-cluster prioritization under limited response resources.",
  },
};

export function ScenarioDescription({ scenario }: Props) {
  const details = scenarioDetails[scenario] ?? scenarioDetails.balanced;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold text-white">{details.title}</h2>
      <p className="mt-2 text-sm text-slate-300">{details.description}</p>
      <p className="mt-3 text-sm text-cyan-300">
        <span className="font-semibold">What this tests: </span>
        {details.tests}
      </p>
    </section>
  );
}