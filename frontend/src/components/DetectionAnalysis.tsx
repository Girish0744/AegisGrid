import { ScanSearch } from "lucide-react";
import type { AegisGridState } from "../types";

export function DetectionAnalysis({ data }: { data: AegisGridState }) {
  const trueDrones = data.true_drones.length;
  const falsePositives = countFalsePositives(data);
  const detectedObjects = data.detections.length;
  const fusedTracks = data.tracks.length;
  const trueDetections = Math.max(0, detectedObjects - falsePositives);
  const missedEstimate =
    data.report?.missed_detection_estimate ?? Math.max(0, trueDrones - trueDetections);
  const detectionRate = data.report?.detection_rate ?? rate(trueDetections, trueDrones);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <ScanSearch size={18} />
            Detection Analysis
          </h2>
          <p className="panel-subtitle">Imperfect sensing view: what was observed, fused, and likely missed.</p>
        </div>
      </div>

      <div className="summary-grid compact">
        <Metric label="True drones" value={trueDrones} />
        <Metric label="Detected objects" value={detectedObjects} />
        <Metric label="Fused tracks" value={fusedTracks} />
        <Metric label="Missed est." value={missedEstimate} tone={missedEstimate > 0 ? "red" : "green"} />
        <Metric label="False positives" value={falsePositives} />
      </div>

      <div className="rate-row">
        <span>Sensor coverage estimate</span>
        <strong>{detectionRate.toFixed(1)}%</strong>
      </div>
      <div className="risk-bar">
        <div className="risk-bar-fill cyan" style={{ width: `${clamp(detectionRate)}%` }} />
      </div>
    </section>
  );
}

function Metric({
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

function countFalsePositives(data: AegisGridState) {
  const detectionFalsePositives = data.detections.filter((detection) => detection.is_false_positive).length;
  const trackFalsePositives = data.tracks.filter((track) => track.is_false_positive).length;

  return Math.max(detectionFalsePositives, trackFalsePositives);
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return (Math.max(0, numerator) / denominator) * 100;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
