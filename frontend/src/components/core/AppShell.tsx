import React from 'react';
import { Icon } from './Icon';

import { Tooltip } from '../feedback/Tooltip';

const STEPS = [
  { key: "job", label: "Role baseline" },
  { key: "candidate", label: "Candidate evidence" },
  { key: "progress", label: "Analysis" },
  { key: "report", label: "Report" },
];

export function Stepper({ current }: { current: string }) {
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

export function AppShell({ current, showStepper = true, children }: { current: string; showStepper?: boolean; children: React.ReactNode }) {
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
          <img src="/logo-mark.svg" width="26" height="26" alt="" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>Technical Maturity Analyzer</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "0.12em", color: "var(--text-muted)" }}>EVIDENCE-FIRST SCREENING PREP</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Tooltip content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-inverse)' }}>Our Methodology</span>
              <span style={{ color: 'var(--text-inverse)', opacity: 0.9 }}>
                A pipeline of 9 specialized AI agents extracts, validates, and cross-references candidate evidence against the defined role baseline.
                Decisions are made purely on public evidence, generating a 2x2 matrix and STAR questions for validation without automated scoring or ranking.
              </span>
            </div>
          }>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-muted)", cursor: "default" }}>
              <Icon name="circle-help" size={15} /> Methodology
            </span>
          </Tooltip>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, borderLeft: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Recruiter Mode</span>
            <span style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>RM</span>
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
