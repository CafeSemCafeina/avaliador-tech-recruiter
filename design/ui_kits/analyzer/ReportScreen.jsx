// Screen 4 — Report. Evidence-first technical maturity analysis. No score.
function ReportScreen({ onRestart }) {
  const { QualBadge, QuadrantCard, StarQuestion, Card, Button, StatusBadge, Avatar, Banner } =
    window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;
  const [methodOpen, setMethodOpen] = React.useState(false);

  const SectionHead = ({ icon, title, sub, right }) => (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={icon} size={17} color="var(--text-secondary)" />
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>
        </div>
        {sub && <p style={{ margin: "4px 0 0 25px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  const badges = [
    ["Seniority Signal", "Mid plausible — validate backend ownership", "validate"],
    ["Stack Evidence", "Strong in React / TypeScript", "confirmed"],
    ["Project Depth", "Moderate, frontend-led", "uncertain"],
    ["Backend Evidence", "Limited in public repos", "gap"],
    ["Public Proof", "Mixed — GitHub yes, portfolio no", "uncertain"],
    ["Interview Priority", "High on backend & deployment", "validate"],
  ];

  const quads = [
    {
      quadrant: "strong_with_evidence",
      title: "React and TypeScript project ownership",
      source: "GitHub repository shows a typed React/Vite application with components, API client structure and documentation.",
      rationale: "Original (non-fork) project with consistent commit history and a clear README.",
      interviewFocus: "Validate ownership, trade-offs and production depth.",
    },
    {
      quadrant: "strong_needs_validation",
      title: "AWS deployment experience",
      source: "Candidate mentions cloud deployment, but public repositories do not show infrastructure files or deployment docs.",
      rationale: "Claim is plausible for the role but evidence is indirect.",
      interviewFocus: "Ask for a concrete deployment story end to end.",
    },
    {
      quadrant: "weak_with_evidence",
      title: "Backend depth for full-stack role",
      source: "Public repositories are mostly frontend-focused and show limited API/server-side logic.",
      rationale: "Relevant gap against a full-stack baseline that expects service ownership.",
      interviewFocus: "Validate whether backend work exists in private or professional projects.",
    },
    {
      quadrant: "weak_needs_validation",
      title: "Testing practice",
      source: "Limited public test files were found. This does not prove a lack of testing experience.",
      rationale: "Weak public signal only; professional work may differ.",
      interviewFocus: "Ask how the candidate tests features in professional work.",
    },
  ];

  const stars = [
    {
      question: "Tell me about a specific project where you owned a feature from implementation to deployment. What was the situation, what were you responsible for, what technical decisions did you make, and what was the result?",
      followUps: ["What trade-offs did you consider?", "How did you validate the solution?", "What would you change if you rebuilt it today?"],
      reveals: "ownership depth, decision-making and production awareness",
    },
    {
      question: "Describe a time you worked on the backend or API side of a system. What was the data flow, and how did you handle errors and edge cases?",
      followUps: ["How did you test it?", "What would you do differently at higher scale?"],
      reveals: "whether backend depth exists beyond the public repositories",
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <Card padding="lg">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <Avatar name="Marina Alvarez" size={48} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>Marina Alvarez</h1>
                <StatusBadge tone="info" dot={false}>Technical maturity report</StatusBadge>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Full-stack Engineer · Mid-level baseline · React, TypeScript, Go
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
                Sources: resume · linkedin · github (3 repos) · portfolio not provided
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Button variant="secondary" leadingIcon={<Icon name="rotate-ccw" size={15} />} onClick={onRestart}>New analysis</Button>
            <Button variant="primary" leadingIcon={<Icon name="download" size={15} />}>Export Markdown</Button>
          </div>
        </div>
      </Card>

      {/* Executive summary */}
      <section>
        <SectionHead icon="file-text" title="Executive summary" />
        <Card padding="lg">
          <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-lg)", lineHeight: "var(--leading-relaxed)", color: "var(--text-primary)" }}>
            Public evidence suggests a capable frontend engineer with clear ownership of typed React work. Against a mid-level full-stack baseline, the strongest uncertainty is backend and deployment depth: claims are plausible but not yet publicly evidenced. None of this indicates a gap in ability — it points to where the technical screen should focus. Treat the items below as an interview map, not a verdict.
          </p>
        </Card>
      </section>

      {/* Qualitative signals */}
      <section>
        <SectionHead icon="tags" title="Qualitative signals" sub="Directional, never numeric. Each is a starting point for the conversation." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {badges.map(([l, v, t]) => <QualBadge key={l} label={l} value={v} tone={t} />)}
        </div>
      </section>

      {/* Evidence matrix — the visual center */}
      <section>
        <SectionHead icon="layout-grid" title="Evidence matrix" sub="Findings placed by strength of signal and how directly evidence supports them." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {quads.map((q) => <QuadrantCard key={q.title} {...q} />)}
        </div>
      </section>

      {/* STAR questions */}
      <section>
        <SectionHead icon="message-square-quote" title="STAR interview questions" sub="Generated from the matrix gaps. Copy individually into your screen notes." />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stars.map((s, i) => <StarQuestion key={i} index={i + 1} {...s} />)}
        </div>
      </section>

      {/* Summaries */}
      <section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card padding="lg">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name="user-round" size={16} color="var(--text-secondary)" />
              <h3 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 600 }}>Recruiter summary</h3>
            </div>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
              Strong, evidenced frontend profile worth moving to a technical screen. Lead with backend and deployment stories to validate full-stack readiness. Portfolio was not provided — consider requesting it before the interview.
            </p>
          </Card>
          <Card padding="lg">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name="users-round" size={16} color="var(--text-secondary)" />
              <h3 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 600 }}>Hiring manager summary</h3>
            </div>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
              Confident React/TypeScript ownership in public work. Open questions: API/server depth, testing practice, and a concrete AWS deployment. The evidence matrix and STAR set are built to resolve these in one screening session.
            </p>
          </Card>
        </div>
      </section>

      {/* Methodology & limitations */}
      <section>
        <Card padding="none">
          <button
            onClick={() => setMethodOpen((o) => !o)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="scale" size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)" }}>Methodology &amp; limitations</span>
            </span>
            <Icon name={methodOpen ? "chevron-up" : "chevron-down"} size={18} color="var(--text-muted)" />
          </button>
          {methodOpen && (
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <Banner tone="neutral" icon={<Icon name="info" size={16} />}>
                This report organizes evidence and questions. It does not produce a match score, a ranking, or a hire/reject decision.
              </Banner>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>How evidence was read</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>GitHub repositories analyzed statically — no code was executed.</li>
                    <li>LinkedIn treated as public self-report, not verified fact.</li>
                    <li>Each finding cites its source and stays separate from inference.</li>
                  </ul>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Limitations</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <li>Absence of public evidence is not evidence of absence.</li>
                    <li>Private and professional work is not visible here.</li>
                    <li>Portfolio was not provided, leaving project depth partly open.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

window.ReportScreen = ReportScreen;
