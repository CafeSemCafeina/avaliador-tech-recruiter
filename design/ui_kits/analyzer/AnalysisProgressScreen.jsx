// Screen 3 — Analysis Progress. Shows the agentic workflow in progress.
const STAGES = [
  { title: "Parsing resume", detail: "Extracting structured claims from resume.pdf", dur: "1.2s" },
  { title: "Extracting role maturity profile", detail: "Mapping required vs desirable signals for Mid-level", dur: "0.8s" },
  { title: "Reading LinkedIn evidence", detail: "Comparing self-reported experience with resume", dur: "1.0s" },
  { title: "Analyzing GitHub repositories", detail: "3 public, non-empty repos · languages, structure, tests, CI", dur: "3.4s" },
  { title: "Reading portfolio signals", detail: "Portfolio not provided — treated as an open question", dur: "0.3s", end: "warning" },
  { title: "Checking claims against evidence", detail: "Confirming, flagging, and marking items for validation", dur: "2.1s" },
  { title: "Building evidence matrix", detail: "Placing findings across the four quadrants", dur: "1.5s" },
  { title: "Generating STAR questions", detail: "Interview prompts from matrix gaps", dur: "1.8s" },
  { title: "Running analyst self-review", detail: "Checking that no gap is read as a verdict", dur: "1.1s" },
  { title: "Finalizing report", detail: "Assembling recruiter and hiring-manager summaries", dur: "0.6s" },
];

function AnalysisProgressScreen({ onComplete }) {
  const { StageItem, Banner, Card, Button, Avatar, StatusBadge } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [active, setActive] = React.useState(0); // index currently running; === length when done

  React.useEffect(() => {
    if (active >= STAGES.length) return;
    const t = setTimeout(() => setActive((a) => a + 1), active === 3 ? 1700 : 950);
    return () => clearTimeout(t);
  }, [active]);

  const done = active >= STAGES.length;
  const stateFor = (i) => {
    if (i < active) return STAGES[i].end || "completed";
    if (i === active) return "running";
    return "pending";
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>
            {done ? "Analysis complete" : "Analyzing technical maturity"}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
            Marina Alvarez · Full-stack Engineer (Mid-level baseline)
          </p>
        </div>
        <StatusBadge tone={done ? "confirmed" : "info"}>
          {done ? "Report ready" : `Stage ${Math.min(active + 1, STAGES.length)} of ${STAGES.length}`}
        </StatusBadge>
      </div>

      <Card padding="md" tone="sunken">
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="Marina Alvarez" size={36} />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Marina Alvarez</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Candidate</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[["Resume", "file-text"], ["LinkedIn", "linkedin"], ["GitHub · 3 repos", "github"]].map(([l, ic]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                <Icon name={ic} size={14} color="var(--text-muted)" /> {l}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div style={{ marginBottom: 16, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Pipeline
        </div>
        {STAGES.map((s, i) => (
          <StageItem
            key={s.title}
            state={stateFor(i)}
            title={s.title}
            detail={i <= active ? s.detail : null}
            duration={i < active ? s.dur : null}
            last={i === STAGES.length - 1}
          />
        ))}
      </Card>

      <Banner tone="neutral" icon={<Icon name="info" size={16} />}>
        The system organizes evidence and questions. It does not make a hiring decision.
      </Banner>

      {done && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="accent" size="lg" onClick={onComplete} trailingIcon={<Icon name="arrow-right" size={17} />}>
            View report
          </Button>
        </div>
      )}
    </div>
  );
}

window.AnalysisProgressScreen = AnalysisProgressScreen;
