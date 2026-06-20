// AppShell — header + optional wizard stepper. Wraps every analyzer screen.
const STEPS = [
  { key: "job", label: "Role baseline" },
  { key: "candidate", label: "Candidate evidence" },
  { key: "progress", label: "Analysis" },
  { key: "report", label: "Report" },
];

function Stepper({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "todo";
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 22, height: 22, borderRadius: "50%", flex: "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                  background: state === "done" ? "var(--status-confirmed-solid)" : state === "active" ? "var(--surface-inverse)" : "var(--surface-card)",
                  color: state === "todo" ? "var(--text-muted)" : "var(--text-inverse)",
                  border: state === "todo" ? "1px solid var(--border-default)" : "1px solid transparent",
                }}
              >
                {state === "done" ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: state === "active" ? 600 : 500, color: state === "active" ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ width: 28, height: 1, background: "var(--border-default)", margin: "0 12px", flex: "none" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AppShell({ current, showStepper = true, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-app)" }}>
      <header
        style={{
          height: "var(--header-height)", flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)",
          position: "sticky", top: 0, zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="../../assets/logo-mark.svg" width="26" height="26" alt="" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>Technical Maturity Analyzer</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "0.12em", color: "var(--text-muted)" }}>EVIDENCE-FIRST SCREENING PREP</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <Icon name="circle-help" size={15} /> Methodology
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, borderLeft: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Dana Okafor</span>
            <span style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>DO</span>
          </div>
        </div>
      </header>

      {showStepper && (
        <div style={{ flex: "none", padding: "14px 24px", background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "center" }}>
          <Stepper current={current} />
        </div>
      )}

      <main style={{ flex: 1, padding: "32px 24px 64px" }}>{children}</main>
    </div>
  );
}

window.AppShell = AppShell;
window.Stepper = Stepper;
