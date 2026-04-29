import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Play, Pause, RotateCcw, AlertTriangle, Target,
  Zap, Activity, Radio, Crosshair, Radar, Settings, BarChart3
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────── */
interface Drone {
  id: string;
  true_x: number;
  true_y: number;
  speed: number;
  behavior: string;
  is_decoy: boolean;
}

interface Cluster {
  cluster_id: number;
  drone_count: number;
  center_x: number;
  center_y: number;
  avg_speed: number;
  avg_confidence: number;
  distance_to_target: number;
  eta: number;
  threat_score: number;
  threat_level: 'low' | 'medium' | 'critical';
  decoy_ratio: number;
  false_positive_ratio: number;
}

interface Assignment {
  resource_id: string;
  cluster_id: number;
  strategy: string;
  reason: string;
}

interface StrategyResult {
  strategy: string;
  assignments: Assignment[];
}

interface EvalMetrics {
  breach_risk: number;
  resource_waste: number;
  response_efficiency: number;
}

interface StateData {
  scenario: string;
  true_drones: Drone[];
  clusters: Cluster[];
  baseline_decision: StrategyResult;
  aegisgrid_decision: StrategyResult;
  evaluation: { baseline: EvalMetrics; aegisgrid: EvalMetrics; improvement: number };
}

/* ── Constants ──────────────────────────────────────── */
const API = 'http://localhost:8000';
const MAP = 1000;
const PHONETIC = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GOLF','HOTEL','INDIA','JULIET','KILO','LIMA'];

const clusterName = (id: number) => `C-${PHONETIC[id] ?? id}`;
const priorityOf = (level: string) => level === 'critical' ? 'P1' : level === 'medium' ? 'P2' : 'P3';

const formatTime = (sec: number) => {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `T+${m}:${s}`;
};

/* ── App ────────────────────────────────────────────── */
export default function App() {
  const [state, setState] = useState<StateData | null>(null);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const r = await fetch(`${API}/state`);
      const d: StateData = await r.json();
      setState(d);
      const avg = d.clusters.length
        ? d.clusters.reduce((s, c) => s + c.threat_score, 0) / d.clusters.length
        : 0;
      setHistory(h => [...h.slice(-59), avg]);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchState(); }, [fetchState]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        fetchState();
        setTick(t => t + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, fetchState]);

  const reset = async () => {
    setRunning(false);
    setTick(0);
    setHistory([]);
    try { await fetch(`${API}/reset`, { method: 'POST' }); } catch {}
    fetchState();
  };

  const clusters = state?.clusters?.slice().sort((a, b) => b.threat_score - a.threat_score) ?? [];
  const critCount = clusters.filter(c => c.threat_level === 'critical').length;
  const droneCount = state?.true_drones.length ?? 0;

  const sensorConf = clusters.length
    ? (clusters.reduce((s, c) => s + c.avg_confidence, 0) / clusters.length) * 100
    : 0;

  const aegisAssignments = state?.aegisgrid_decision?.assignments ?? [];
  const clusterAssignmentMap = new Map<number, number>();
  aegisAssignments.forEach(a => clusterAssignmentMap.set(a.cluster_id, (clusterAssignmentMap.get(a.cluster_id) ?? 0) + 1));

  const breachRisk = state?.evaluation?.aegisgrid?.breach_risk ?? 0;

  return (
    <>
      <div className="app">
        {/* ── SIDEBAR ──────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Shield size={26} className="logo-icon" />
            <div>
              <h1>AEGISGRID</h1>
              <div className="sub">SIM PLATFORM</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-item active"><Zap size={16} /> Main Dashboard</div>
            <div className="nav-item"><BarChart3 size={16} /> Swarm Analysis</div>
            <div className="nav-item"><Radio size={16} /> Sensor Fusion</div>
            <div className="nav-item"><Crosshair size={16} /> Response Plan</div>
            <div className="nav-item"><Settings size={16} /> Settings</div>
          </nav>

          <div className="system-status">
            <h3>System Status</h3>
            {[
              { name: 'AESA RADAR', status: 'ONLINE', led: 'green' },
              { name: 'RF LINK', status: 'ONLINE', led: 'green' },
              { name: 'SATCOM', status: 'DEGRADED', led: 'amber' },
              { name: 'GPS', status: 'ONLINE', led: 'green' },
            ].map(s => (
              <div className="status-row" key={s.name}>
                <span className="status-label">{s.name}</span>
                <span className="status-value">
                  {s.status}
                  <span className={`led led-${s.led}`} />
                </span>
              </div>
            ))}
          </div>

          <div className="sys-log">▸ SYSTEM_LOG RUNNING</div>
        </aside>

        {/* ── TOPBAR ───────────────────────────────────── */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="op-name">OP. CRYSTAL DOME — Sector 7</span>
            <div className="stat-group">
              <span className="stat">DRONES: <strong>{droneCount}</strong></span>
              <span className="stat">CLUSTERS: <strong>{clusters.length}</strong></span>
              <span className="stat">CRITICAL: <strong className="critical-count">{critCount}</strong></span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="timer">{formatTime(tick)}</span>
            <button className={`btn ${running ? 'active' : ''}`} onClick={() => setRunning(!running)}>
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? 'PAUSE' : 'START'}
            </button>
            <button className="btn btn-danger" onClick={reset}>
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        </header>

        {/* ── MAP ──────────────────────────────────────── */}
        <section className="map-area">
          <div className="map-grid" />

          {/* Radar rings */}
          {[20, 40, 60, 80].map(pct => (
            <div key={pct} className="radar-ring" style={{ width: `${pct}%`, height: `${pct}%` }} />
          ))}

          {/* Scan sweep */}
          <div className="scan-line" />

          {/* Target */}
          <div className="target-marker">
            <div className="target-hex"><Shield size={20} color="var(--cyan)" /></div>
            <span className="target-label">Area Center Alpha</span>
          </div>

          {/* Drones */}
          {state?.true_drones.map(d => (
            <div
              key={d.id}
              className={`drone-dot ${d.is_decoy ? 'decoy' : 'attack'}`}
              style={{
                left: `${(d.true_x / MAP) * 100}%`,
                top: `${(d.true_y / MAP) * 100}%`,
              }}
            />
          ))}

          {/* Clusters */}
          {clusters.map(c => {
            const size = Math.max(50, c.drone_count * 6);
            return (
              <div
                key={`cl-${c.cluster_id}`}
                className={`cluster-ring ${c.threat_level}`}
                style={{
                  left: `${(c.center_x / MAP) * 100}%`,
                  top: `${(c.center_y / MAP) * 100}%`,
                  width: size, height: size,
                }}
              >
                <span className={`cluster-map-label ${c.threat_level}`}>
                  {clusterName(c.cluster_id)} — THREAT {(c.threat_score * 100).toFixed(0)}
                </span>
              </div>
            );
          })}
        </section>

        {/* ── CLUSTER PANEL ────────────────────────────── */}
        <section className="cluster-panel">
          <div className="cluster-panel-header">
            <h2><Radar size={16} color="var(--cyan)" /> Active Clusters</h2>
            <span className="cluster-badge">{clusters.length} DETECTED</span>
          </div>

          {clusters.map(c => {
            const assigned = clusterAssignmentMap.get(c.cluster_id) ?? 0;
            return (
              <div key={c.cluster_id} className={`cluster-card ${c.threat_level}`}>
                <div className="cluster-card-header">
                  <div>
                    <div className="cluster-name">{clusterName(c.cluster_id)}</div>
                    <div className="cluster-units">{c.drone_count} UNITS</div>
                  </div>
                  <span className={`priority-badge ${priorityOf(c.threat_level).toLowerCase()}`}>
                    {priorityOf(c.threat_level)}
                  </span>
                </div>

                <div className="threat-bar-container">
                  <div className="threat-bar-label">
                    <span>THREAT SCORE</span>
                    <span>{(c.threat_score * 100).toFixed(0)}</span>
                  </div>
                  <div className="threat-bar">
                    <div
                      className={`threat-bar-fill ${c.threat_level}`}
                      style={{ width: `${c.threat_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="eta-display">
                  <span className="eta-label">ETA TO IMPACT</span>
                  <span className="eta-value">
                    {c.eta > 900 ? '>15:00' : `${Math.floor(c.eta / 60)}:${String(Math.floor(c.eta) % 60).padStart(2, '0')}`}
                  </span>
                </div>

                <div className="countermeasures">
                  <Crosshair size={12} />
                  {assigned > 0
                    ? `${assigned} Interceptor${assigned > 1 ? 's' : ''} assigned`
                    : 'No countermeasures assigned'}
                </div>
              </div>
            );
          })}

          {clusters.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40, fontSize: 13 }}>
              No active clusters. Press START to begin simulation.
            </div>
          )}
        </section>

        {/* ── BOTTOM PANELS ────────────────────────────── */}
        <section className="bottom-panels">
          {/* Threat Trend */}
          <div className="bottom-card">
            <div className="bottom-card-title"><Activity size={14} color="var(--red)" /> THREAT TREND (60s)</div>
            <div className="sparkline-container">
              <svg viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,45,85,0.25)" />
                    <stop offset="100%" stopColor="rgba(255,45,85,0)" />
                  </linearGradient>
                </defs>
                {history.length > 1 && (
                  <>
                    <polygon
                      fill="url(#tg)"
                      points={`0,80 ${history.map((v, i) => `${(i / 59) * 300},${80 - v * 80}`).join(' ')} ${((history.length - 1) / 59) * 300},80`}
                    />
                    <polyline
                      fill="none"
                      stroke="var(--red)"
                      strokeWidth="2"
                      points={history.map((v, i) => `${(i / 59) * 300},${80 - v * 80}`).join(' ')}
                    />
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Sensor Confidence */}
          <div className="bottom-card">
            <div className="bottom-card-title"><Radio size={14} color="var(--cyan)" /> FUSED SENSOR CONFIDENCE</div>
            <div className="big-number cyan">{sensorConf.toFixed(1)}<span className="unit">%</span></div>
            <div className="confidence-bar">
              <div className="confidence-bar-fill" style={{ width: `${sensorConf}%` }} />
            </div>
          </div>

          {/* Active Measures */}
          <div className="bottom-card">
            <div className="bottom-card-title"><Crosshair size={14} color="var(--green)" /> ACTIVE MEASURES</div>
            <div className="measures-grid">
              <div className="measure-item">
                <div className="measure-val">{aegisAssignments.length}</div>
                <div className="measure-lbl">INTERCEPTORS</div>
              </div>
              <div className="measure-item">
                <div className="measure-val">{clusters.length}</div>
                <div className="measure-lbl">TRACKED CLUSTERS</div>
              </div>
            </div>
          </div>

          {/* Breach Risk */}
          <div className="bottom-card">
            <div className="bottom-card-title"><AlertTriangle size={14} color="var(--red)" /> BREACH RISK</div>
            <div className={`big-number ${breachRisk > 50 ? 'red' : breachRisk > 20 ? 'cyan' : 'green'}`}>
              {breachRisk.toFixed(0)}<span className="unit">%</span>
            </div>
          </div>
        </section>
      </div>

      <div className="disclaimer">
        AEGISGRID SIMULATION PLATFORM — DECISION SUPPORT ONLY. NO LIVE WEAPONS OR DRONE CONTROL.
      </div>
    </>
  );
}
