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
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{details.title}</h2>
          <p className="panel-subtitle">{details.description}</p>
        </div>
      </div>

      <div className="alert-box">
        <strong>What this tests</strong>
        <p>{details.tests}</p>
      </div>
    </section>
  );
}
