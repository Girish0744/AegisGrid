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
}

  return (
    <div className="app">
      <header className="header">
        <div>
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
            <ScenarioSelector
              scenario={data?.scenario_type ?? data?.scenario ?? "balanced"}
              onChange={resetScenario}
            />
            <ScenarioDescription scenario={data?.scenario_type ?? data?.scenario ?? "balanced"} />
            <PipelineStatus data={data} />
            <ScenarioPanel data={data} />
            <MetricsPanel data={data} />
            <ThreatPanel data={data} />
            <ActionsPanel data={data} />
            <ScenarioNarrative data={data} />
          </aside>
        </main>
      ) : (
        <div className="loading">Loading AegisGrid...</div>
      )}
    </div>
  );
}

export default App;
