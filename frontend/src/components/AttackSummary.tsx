import { Radar } from "lucide-react";
import type { AegisGridState } from "../types";

export function AttackSummary({ data }: { data: AegisGridState }) {
  const scenario = formatScenario(data.scenario_type ?? data.scenario ?? "unknown");
  const simulatedDrones = data.true_drones.length;
  const detections = data.detections.length;
  const tracks = data.tracks.length;
  const clusters = data.report?.cluster_count ?? data.clusters.length;
  const detectionRate =
    data.report?.detection_rate ?? rate(detections - falsePositiveCount(data), simulatedDrones);
  const missedEstimate =
    data.report?.missed_detection_estimate ??
    Math.max(0, simulatedDrones - Math.max(0, detections - falsePositiveCount(data)));

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <Radar size={18} />
            Attack Summary
          </h2>
          <p className="panel-subtitle">Human-readable snapshot of the current swarm event.</p>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Scenario" value={scenario} />
        <SummaryCard label="Simulated" value={`${simulatedDrones} drones`} />
        <SummaryCard label="Detections" value={detections} />
        <SummaryCard label="Missed est." value={missedEstimate} tone={missedEstimate > 0 ? "red" : "green"} />
        <SummaryCard label="Tracks" value={tracks} />
        <SummaryCard label="Clusters" value={clusters} />
      </div>

      <div className="rate-row">
        <span>Detection rate</span>
        <strong>{detectionRate.toFixed(1)}%</strong>
      </div>
      <div className="risk-bar">
        <div className="risk-bar-fill cyan" style={{ width: `${clamp(detectionRate)}%` }} />
      </div>

      <p className="interpretation">{buildInterpretation(clusters, missedEstimate)}</p>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red";
}) {
  return (
    <div className={`summary-card ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function falsePositiveCount(data: AegisGridState) {
  return data.detections.filter((detection) => detection.is_false_positive).length;
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return (Math.max(0, numerator) / denominator) * 100;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatScenario(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildInterpretation(clusters: number, missedEstimate: number) {
  if (clusters > 1) {
    return "Multiple swarm groups are being tracked under partial sensor visibility.";
  }

  if (missedEstimate > 0) {
    return "A consolidated swarm picture is forming, but sensor visibility remains incomplete.";
  }

  return "The current attack picture is stable with high sensor coverage.";
}
