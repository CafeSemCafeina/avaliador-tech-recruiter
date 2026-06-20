// Screen 1 — Job Input. Recruiter defines the technical role baseline.
function JobInputScreen({ onContinue }) {
  const { Field, Textarea, Input, SegmentedControl, Tag, Button, Card } = window.TechnicalMaturityAnalyzerDesignSystem_3be3ec;

  const [jd, setJd] = React.useState(
    "We're hiring a full-stack engineer to own customer-facing features end to end. You'll work across a typed React frontend and Go services on AWS, collaborate on API design, and care about testing and deployment quality."
  );
  const [level, setLevel] = React.useState("Mid-level");
  const [years, setYears] = React.useState("");
  const [stacks, setStacks] = React.useState([
    { name: "React", primary: true },
    { name: "TypeScript", primary: true },
    { name: "Go", primary: true },
    { name: "PostgreSQL", primary: false },
    { name: "AWS", primary: false },
    { name: "Docker", primary: false },
  ]);
  const [draft, setDraft] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const primaryCount = stacks.filter((s) => s.primary).length;

  const addStack = () => {
    const v = draft.trim();
    if (!v || stacks.some((s) => s.name.toLowerCase() === v.toLowerCase())) { setDraft(""); return; }
    setStacks([...stacks, { name: v, primary: false }]);
    setDraft("");
  };
  const togglePrimary = (name) =>
    setStacks((prev) =>
      prev.map((s) => {
        if (s.name !== name) return s;
        if (!s.primary && primaryCount >= 3) return s;
        return { ...s, primary: !s.primary };
      })
    );
  const remove = (name) => setStacks((prev) => prev.filter((s) => s.name !== name));

  const SectionTitle = ({ n, children, hint }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{n}</span>
        <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)" }}>{children}</h3>
      </div>
      {hint && <p style={{ margin: "4px 0 0 26px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>Define the role baseline</h1>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
          Evidence-first screening prep for technical roles. The baseline guides how candidate evidence is weighed — it is not a scoring rubric.
        </p>
      </div>

      <Card padding="lg">
        <SectionTitle n="01">Job description</SectionTitle>
        <Field htmlFor="jd" hint="Paste the full description. Responsibilities and required technologies improve the role profile.">
          <Textarea id="jd" rows={7} value={jd} onChange={(e) => setJd(e.target.value)} showCount maxLength={6000} />
        </Field>
      </Card>

      <Card padding="lg">
        <SectionTitle n="02">Seniority &amp; experience</SectionTitle>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Seniority baseline">
            <SegmentedControl options={["Intern", "Junior", "Mid-level", "Senior", "Staff"]} value={level} onChange={setLevel} />
          </Field>
          <Field label="Years of experience" htmlFor="yr" optional style={{ width: 160 }}>
            <Input id="yr" type="number" min="0" placeholder="e.g. 5" value={years} onChange={(e) => setYears(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card padding="lg">
        <SectionTitle n="03" hint="Mark up to 3 primary stacks. Primary stacks focus the evidence matrix and STAR questions on what matters most for this role.">
          Tech stack
        </SectionTitle>
        <Field label="Add a technology" htmlFor="stack">
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              id="stack"
              placeholder="Type a technology and press Enter"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStack(); } }}
            />
            <Button variant="secondary" onClick={addStack}>Add</Button>
          </div>
        </Field>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Selected stacks
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: primaryCount >= 3 ? "var(--status-validate-fg)" : "var(--text-muted)" }}>
              {primaryCount} / 3 primary
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stacks.map((s) => (
              <Tag key={s.name} primary={s.primary} removable onRemove={() => remove(s.name)} onClick={() => togglePrimary(s.name)}>
                {s.name}
              </Tag>
            ))}
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Click a chip to toggle it as primary. Primary stacks are shown with a dot.
          </p>
        </div>
      </Card>

      <Card padding="lg">
        <SectionTitle n="04">Recruiter notes</SectionTitle>
        <Field htmlFor="notes" optional hint="Context the analysis should keep in mind — team, constraints, what you're unsure about.">
          <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Replacing a senior who owned deployment. Backend ownership matters more than breadth." />
        </Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="accent" size="lg" onClick={onContinue} trailingIcon={<Icon name="arrow-right" size={17} />}>
          Continue to candidate evidence
        </Button>
      </div>
    </div>
  );
}

window.JobInputScreen = JobInputScreen;
