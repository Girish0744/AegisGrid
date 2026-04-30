import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { analyzeAISnapshot } from "../api";

type SnapshotAnalysis = {
  title: string;
  situation: string;
  primary_risk: string;
  recommended_focus: string;
  evidence: string[];
  trust_status: string;
};

export function AISnapshotAnalysisPanel() {
  const [analysis, setAnalysis] = useState<SnapshotAnalysis | null>(null);
  //const [snapshotTick, setSnapshotTick] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleAnalyze() {
    try {
      setIsAnalyzing(true);
      const result = await analyzeAISnapshot();
      setAnalysis(result.analysis);
      //setSnapshotTick(result.snapshot_tick);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="panel">
      <h2>
        <BrainCircuit size={18} />
        AI Snapshot Analysis
      </h2>

      <p className="panel-subtitle">
        Captures the current operational state for AI analysis while live tracking continues.
      </p>

      <button
        className="demo-button"
        type="button"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "Analyzing Current Situation..." : "Analyze Current Situation"}
      </button>

      {analysis && (
        <div className="snapshot-analysis">
          <div className="verdict-card">
            <strong>{analysis.title}</strong>
            {/* <span>
              Trust: {analysis.trust_status}
              {snapshotTick !== null ? ` · Tick ${snapshotTick}` : ""}
            </span> */}
          </div>

          <p>{analysis.situation}</p>

          <p>
            <strong>Primary Risk:</strong> {analysis.primary_risk}
          </p>

          <p>
            <strong>Recommended Focus:</strong> {analysis.recommended_focus}
          </p>

          <div className="report-section">
            <h3>Evidence</h3>
            <ul>
              {analysis.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}