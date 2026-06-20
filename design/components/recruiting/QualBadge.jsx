import React from "react";

/**
 * QualBadge — a labeled qualitative signal for the report header
 * (Seniority Signal, Stack Evidence, Project Depth, …). Carries a label,
 * a short qualitative value, and a muted status tone. Never numeric.
 */
export function QualBadge({ label, value, tone = "neutral", style }) {
  const map = {
    confirmed: { fg: "var(--status-confirmed-fg)", solid: "var(--status-confirmed-solid)" },
    validate:  { fg: "var(--status-validate-fg)", solid: "var(--status-validate-solid)" },
    gap:       { fg: "var(--status-gap-fg)", solid: "var(--status-gap-solid)" },
    uncertain: { fg: "var(--status-uncertain-fg)", solid: "var(--status-uncertain-solid)" },
    info:      { fg: "var(--status-info-fg)", solid: "var(--status-info-solid)" },
    neutral:   { fg: "var(--text-secondary)", solid: "var(--neutral-400)" },
  };
  const c = map[tone] || map.neutral;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "12px 14px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: c.solid, flex: "none" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-primary)", lineHeight: "var(--leading-snug)" }}>
        {value}
      </span>
    </div>
  );
}
