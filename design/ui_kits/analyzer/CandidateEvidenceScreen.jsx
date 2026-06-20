// Screen 2 — Candidate Evidence. Recruiter provides evidence sources.
function CandidateEvidenceScreen({ onBack, onStart }) {
  const { SourceCard, Textarea, Input, Field, Button, Banner, Card } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;

  const [resume, setResume] = React.useState({ filled: true, file: "marina-alvarez-resume.pdf · 184 KB", text: "" });
  const [linkedin, setLinkedin] = React.useState({ filled: false, text: "" });
  const [github, setGithub] = React.useState("github.com/marina-dev");
  const [portfolio, setPortfolio] = React.useState("");
  const [notes, setNotes] = React.useState("");

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>Add candidate evidence</h1>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
          Provide the sources the analysis should read. More sources mean fewer uncertainties — but missing evidence is treated as a question, never a verdict.
        </p>
      </div>

      <Banner tone="info" icon={<Icon name="shield" size={17} />} title="Privacy">
        Files are processed for this analysis only. Reports are stored in memory for the current session and may be lost on restart. Do not upload sensitive data you do not want processed in this demo.
      </Banner>

      <SourceCard
        icon={<Icon name="file-text" size={18} />}
        title="Resume"
        description="PDF or pasted text. Used to extract technical claims."
        required
        filled={resume.filled}
        meta={resume.filled ? resume.file : null}
        action={
          resume.filled
            ? <Button size="sm" variant="ghost" onClick={() => setResume({ filled: false, file: "", text: "" })}>Replace</Button>
            : <Button size="sm" variant="secondary" leadingIcon={<Icon name="upload" size={15} />} onClick={() => setResume({ filled: true, file: "marina-alvarez-resume.pdf · 184 KB", text: "" })}>Upload PDF</Button>
        }
      >
        {!resume.filled && (
          <Field htmlFor="resumeTxt"><Textarea id="resumeTxt" rows={4} placeholder="…or paste the resume text here" value={resume.text} onChange={(e) => setResume({ ...resume, text: e.target.value })} /></Field>
        )}
      </SourceCard>

      <SourceCard
        icon={<Icon name="linkedin" size={18} />}
        title="LinkedIn export"
        description="Upload a profile PDF or paste exported text. No login, cookies, or private access — this reads only what you provide."
        filled={linkedin.filled}
        action={<Button size="sm" variant="secondary" leadingIcon={<Icon name="upload" size={15} />} onClick={() => setLinkedin({ ...linkedin, filled: true })}>Upload PDF</Button>}
      >
        <Field htmlFor="liTxt"><Textarea id="liTxt" rows={3} placeholder="Paste exported LinkedIn text (Experience, Skills, Education)…" value={linkedin.text} onChange={(e) => setLinkedin({ filled: e.target.value.length > 0, text: e.target.value })} /></Field>
      </SourceCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SourceCard icon={<Icon name="github" size={18} />} title="GitHub" description="Public, non-empty repositories only." filled={github.length > 0}>
          <Field htmlFor="gh"><Input id="gh" leading={<Icon name="link" size={15} />} placeholder="github.com/username" value={github} onChange={(e) => setGithub(e.target.value)} /></Field>
        </SourceCard>
        <SourceCard icon={<Icon name="globe" size={18} />} title="Portfolio" description="Project pages and case studies." filled={portfolio.length > 0}>
          <Field htmlFor="pf"><Input id="pf" leading={<Icon name="link" size={15} />} placeholder="https://portfolio.dev" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} /></Field>
        </SourceCard>
      </div>

      <Card padding="lg">
        <Field label="Recruiter notes" htmlFor="cnotes" optional hint="Anything the analyst should weigh — referrals, prior conversations, specific concerns.">
          <Textarea id="cnotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Referred internally. Strong portfolio but unsure about backend depth." />
        </Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Button variant="ghost" size="lg" onClick={onBack} leadingIcon={<Icon name="arrow-left" size={17} />}>Back to role</Button>
        <Button variant="accent" size="lg" onClick={onStart} trailingIcon={<Icon name="scan-line" size={17} />}>Start analysis</Button>
      </div>
    </div>
  );
}

window.CandidateEvidenceScreen = CandidateEvidenceScreen;
