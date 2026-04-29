import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { getState, resetSimulation } from "./api";
import { ActionsPanel } from "./components/ActionsPanel";
import { MetricsPanel } from "./components/MetricsPanel";
import { ScenarioPanel } from "./components/ScenarioPanel";
import { SwarmMap } from "./components/SwarmMap";
import { ThreatPanel } from "./components/ThreatPanel";
import { ScenarioNarrative } from "./components/ScenarioNarrative";
import { ScenarioSelector } from "./components/ScenarioSelector";
import { ScenarioDescription } from "./components/ScenarioDescription";
import { PipelineStatus } from "./components/PipelineStatus";
import { LogPanel } from "./components/LogPanel";
import type { AegisGridState } from "./types";
import "./App.css";

function App() {
  const [data, setData] = useState<AegisGridState | null>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    const initialFetchId = window.setTimeout(fetchState, 0);
    const intervalId = window.setInterval(fetchState, 800);

    return () => {
      window.clearTimeout(initialFetchId);
      window.clearInterval(intervalId);
    };
  }, [fetchState]);

  const handleReset = async () => {
    try {
      await resetSimulation();
      await fetchState();
    } catch {
      setError("Could not reset the simulation. Check the backend server.");
    }
  };

  async function resetScenario(scenario: string) {
  await fetch(`http://127.0.0.1:8000/reset?scenario_type=${scenario}`, {
    method: "POST",
  });

  await fetchState();
}

async function runDemoMode() {
  const scenarios = ["balanced", "decoy_heavy", "split_attack"];

  for (const scenario of scenarios) {
    await fetch(`http://127.0.0.1:8000/reset?scenario_type=${scenario}`, {
      method: "POST",
    });

    await fetchState();

    await new Promise((resolve) => setTimeout(resolve, 7000));
  }
}
  

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Decision Intelligence Console</p>
          <h1>AegisGrid</h1>
          <p>Counter-Swarm Decision Intelligence Platform</p>
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

          <button className="demo-button" type="button" onClick={runDemoMode}>
            Run Demo Mode
          </button>
        </div>
      </header>

      {error && !data ? (
        <div className="error">{error}</div>
      ) : data ? (
        <main className="layout">
          <section className="map-card">
            <SwarmMap data={data} />
          </section>

          <aside className="side">
            <MetricsPanel data={data} />
            <ThreatPanel data={data} />
            <PipelineStatus data={data} />
            <ActionsPanel data={data} />
          </aside>

          <section className="bottom-grid">
            <div className="control-stack">
              <ScenarioSelector
                scenario={data?.scenario_type ?? data?.scenario ?? "balanced"}
                onChange={resetScenario}
              />
              <ScenarioDescription scenario={data?.scenario_type ?? data?.scenario ?? "balanced"} />
              <ScenarioPanel data={data} />
            </div>

            <div className="narrative-stack">
              <ScenarioNarrative data={data} />
              <LogPanel data={data} />
            </div>
          </section>
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
