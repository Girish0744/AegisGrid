type Props = {
  isBooting: boolean;
  onStart: () => void;
};

const bootLines = [
  "Initializing sensor fusion...",
  "Calibrating threat model...",
  "Opening tactical dashboard...",
];

export function StartScreen({ isBooting, onStart }: Props) {
  return (
    <main className={`start-screen ${isBooting ? "booting" : ""}`}>
      <div className="start-background-grid" />
      <div className="start-scan-sweep" />
      <div className="start-orbit orbit-one" />
      <div className="start-orbit orbit-two" />
      <div className="start-track track-one" />
      <div className="start-track track-two" />
      <div className="start-track track-three" />
      <div className="start-route route-one" />
      <div className="start-route route-two" />
      <div className="start-route route-three" />

      {/* ── Transition overlay ── */}
      {isBooting && (
        <div className="boot-overlay" aria-hidden="true">
          <div className="boot-scanline" />
          <div className="boot-flash" />
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="start-topbar">

        <div className="start-topbar-center">
          <span>COUNTER-SWARM DECISION INTELLIGENCE</span>
        </div>
      </header>


      {/* ── Center hero ── */}
      <section className="start-panel" aria-label="Launch scan">
        <div className="start-logo-wrap">
          <div className="radar-ring ring-one" />
          <div className="radar-ring ring-two" />
          <div className="radar-sweep" />
          <img src="/aegisgrid-logo.jpeg" alt="AegisGrid logo" className="start-logo" />
        </div>

        <p className="eyebrow">Decision Intelligence Console</p>
        <h1 className="start-title">AegisGrid</h1>
        <p className="start-tagline">Detect · Decide · Defend</p>
        <p className="start-description">Counter-Swarm Decision Intelligence Platform</p>

        {isBooting ? (
          <>
            <div className="scan-loader" aria-hidden="true">
              <span />
            </div>
            <div className="boot-lines" aria-live="polite">
              {bootLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </>
        ) : (
          <>
            <button className="start-button" type="button" onClick={onStart}>
              Start Scan
            </button>
          </>
        )}
      </section>


    </main>
  );
}
