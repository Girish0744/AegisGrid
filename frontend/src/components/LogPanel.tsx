import { useEffect, useMemo, useRef, useState } from "react";
import { ListChecks } from "lucide-react";
import type { AegisGridState } from "../types";

type LogEntry = {
  id: string;
  time: string;
  message: string;
  detail: string;
  tone: "green" | "red" | "cyan" | "gray";
};

export function LogPanel({ data }: { data: AegisGridState }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const lastSignature = useRef("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const topThreat = useMemo(
    () => [...data.clusters].sort((a, b) => (b.threat_score ?? 0) - (a.threat_score ?? 0))[0],
    [data.clusters],
  );

  useEffect(() => {
    const signature = [
      data.clusters.length,
      topThreat?.cluster_id ?? "none",
      topThreat?.threat_score ?? 0,
      data.aegisgrid_decision.assignments.length,
      data.evaluation.improvement.toFixed(1),
    ].join(":");

    if (signature === lastSignature.current) {
      return;
    }

    lastSignature.current = signature;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const eventId = `${signature}-${Date.now()}`;

    const nextEntries: LogEntry[] = [
      {
        id: `${eventId}-clusters`,
        time,
        message: "Cluster detected",
        detail: `${data.clusters.length} active cluster${data.clusters.length === 1 ? "" : "s"} in the battlespace.`,
        tone: "cyan",
      },
      {
        id: `${eventId}-resources`,
        time,
        message: "Resources allocated",
        detail: `${data.aegisgrid_decision.assignments.length} response assets assigned by AegisGrid.`,
        tone: "green",
      },
    ];

    if (topThreat) {
      nextEntries.unshift({
        id: `${eventId}-top-threat`,
        time,
        message: "Top threat updated",
        detail: `Cluster ${topThreat.cluster_id} scored ${(topThreat.threat_score ?? 0).toFixed(1)} with ETA ${topThreat.eta ?? "unknown"}s.`,
        tone: topThreat.threat_level === "critical" ? "red" : "green",
      });
    }

    setEntries((current) => [...nextEntries, ...current].slice(0, 18));
  }, [data, topThreat]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [entries]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>
            <ListChecks size={18} />
            Activity Feed
          </h2>
          <p className="panel-subtitle">Timestamped operational events from the live state stream.</p>
        </div>
      </div>

      <div className="log-list" ref={listRef}>
        {entries.map((entry) => (
          <div className="log-entry" key={entry.id}>
            <div className="log-main">
              <div className="log-main">
                <span className={`log-kind ${entry.tone}`} />
                <b>{entry.message}</b>
              </div>
              <span className="log-time">{entry.time}</span>
            </div>
            <p>{entry.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
