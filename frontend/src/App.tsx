import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { getState, resetSimulation } from "./api";
import { ActionsPanel } from "./components/ActionsPanel";
import { AttackSummary } from "./components/AttackSummary";
import { CommandVerdict } from "./components/CommandVerdict";
import { DetectionAnalysis } from "./components/DetectionAnalysis";
import { EventTimeline } from "./components/EventTimeline";
import { MetricsPanel } from "./components/MetricsPanel";
import { OutcomeSummary } from "./components/OutcomeSummary";
import { ScenarioPanel } from "./components/ScenarioPanel";
import { SwarmMap } from "./components/SwarmMap";
import { ThreatPanel } from "./components/ThreatPanel";
import { ScenarioNarrative } from "./components/ScenarioNarrative";
import { ScenarioSelector } from "./components/ScenarioSelector";
import { StartScreen } from "./components/StartScreen";
import { PipelineStatus } from "./components/PipelineStatus";
import { LogPanel } from "./components/LogPanel";
import type { AegisGridState } from "./types";
import "./App.css";

type DashboardView = "live" | "analysis" | "decision" | "outcome";

const dashboardViews: Array<{ id: DashboardView; label: string }> = [
  { id: "live", label: "Live" },
  { id: "analysis", label: "Analysis" },
  { id: "decision", label: "Decision" },
  { id: "outcome", label: "Outcome" },
];

function App() {
  const [data, setData] = useState<AegisGridState | null>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("live");
  const isFetchInFlight = useRef(false);

  const fetchState = useCallback(async () => {
    if (isFetchInFlight.current) {
      return;
    }

    isFetchInFlight.current = true;

    try {
      setIsRefreshing(true);
      const nextState = await getState();
      setData(nextState);
      setError("");
    } catch {
      setError("Backend not connected. Start FastAPI on port 8000.");
    } finally {
      isFetchInFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const initialFetchId = window.setTimeout(fetchState, 0);
    const intervalId = window.setInterval(fetchState, 1200);

    return () => {
      window.clearTimeout(initialFetchId);
      window.clearInterval(intervalId);
    };
  }, [fetchState, hasStarted]);

  function handleStartScan() {
    setIsBooting(true);
    setActiveView("live");

    window.setTimeout(() => {
      setHasStarted(true);
      setIsBooting(false);
    }, 1800);
  }

  const handleReset = async () => {
    try {
      await resetSimulation();
      await fetchState();
    } catch {
      setError("Could not reset the simulation. Check the backend server.");
    }
  };

  async function resetScenario(scenario: string) {
    await resetSimulation(scenario);
    await fetchState();
  }

  async function runDemoMode() {
    const scenarios = ["balanced", "decoy_heavy", "split_attack"];

    for (const scenario of scenarios) {
      await resetSimulation(scenario);
      await fetchState();

      await new Promise((resolve) => setTimeout(resolve, 7000));
    }
  }

  if (!hasStarted) {
    return <StartScreen isBooting={isBooting} onStart={handleStartScan} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/aegisgrid-logo.jpeg" alt="AegisGrid logo" className="brand-logo" />
          <div>
            <p className="eyebrow">Decision Intelligence Console</p>
            <h1>AegisGrid</h1>
            <p>Counter-Swarm Decision Intelligence Platform</p>
          </div>
        </div>

        <div className="header-actions">
          <div className={error ? "badge danger" : "badge"}>
            {error ? <WifiOff size={18} /> : <Wifi size={18} />}
            {error ? "Backend offline" : "Live API feed"}
          </div>

          <button className="icon-button" type="button" onClick={fetchState} title="Refresh">
            <RefreshCw size={18} className={isRefreshing ? "spin" : ""} />
          </button>

          <button className="icon-button" type="button" onClick={handleReset} title="Reset simulation">
            <RotateCcw size={18} />
          </button>

          {data && (
            <div className="header-scenario-control">
              <ScenarioSelector
                compact
                scenario={data.scenario_type ?? data.scenario ?? "balanced"}
                onChange={resetScenario}
              />
            </div>
          )}

          <button className="demo-button" type="button" onClick={runDemoMode}>
            Run Demo Mode
          </button>
        </div>
      </header>

      <nav className="view-tabs" aria-label="Dashboard views">
        {dashboardViews.map((view) => (
          <button
            className={`view-tab ${activeView === view.id ? "active" : ""}`}
            key={view.id}
            type="button"
            onClick={() => setActiveView(view.id)}
            aria-pressed={activeView === view.id}
          >
            {view.label}
          </button>
        ))}
      </nav>

      {error && !data ? (
        <div className="error">{error}</div>
      ) : data ? (
        <main className="view-content">
          {activeView === "live" && (
            <section className="live-layout">
              <section className="map-card">
                <SwarmMap data={data} />
              </section>

              <aside className="live-sidebar">
                <MetricsPanel data={data} />
                <ActionsPanel data={data} />
                <CommandVerdict data={data} />
                <ScenarioPanel data={data} />
              </aside>
            </section>
          )}

          {activeView === "analysis" && (
            <section className="dashboard-grid two-column">
              <AttackSummary data={data} />
              <DetectionAnalysis data={data} />
              <PipelineStatus data={data} />
              <ThreatPanel data={data} />
            </section>
          )}

          {activeView === "decision" && (
            <section className="dashboard-grid two-column">
              <ActionsPanel data={data} />
              <ScenarioNarrative data={data} />
              <EventTimeline data={data} />
              <LogPanel data={data} />
            </section>
          )}

          {activeView === "outcome" && (
            <section className="dashboard-grid two-column">
              <MetricsPanel data={data} />
              <OutcomeSummary data={data} />
              <CommandVerdict data={data} />
              <ScenarioPanel data={data} />
            </section>
          )}
        </main>
      ) : (
        <div className="loading">
          <div className="loading-card">
            Loading AegisGrid...
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton wide" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
