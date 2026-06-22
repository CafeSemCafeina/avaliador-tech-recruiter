import React from "react";

const QUAD = {
  strong_with_evidence:    { label: "Strong with evidence",       tone: "confirmed" },
  strong_needs_validation: { label: "Strong but needs validation", tone: "validate" },
  weak_with_evidence:      { label: "Weak with evidence",          tone: "gap" },
  weak_needs_validation:   { label: "Weak but needs validation",   tone: "uncertain" },
};

const TONE = {
  confirmed: { fg: "var(--status-confirmed-fg)", bg: "var(--status-confirmed-bg)", bd: "var(--status-confirmed-border)", solid: "var(--status-confirmed-solid)" },
  validate:  { fg: "var(--status-validate-fg)", bg: "var(--status-validate-bg)", bd: "var(--status-validate-border)", solid: "var(--status-validate-solid)" },
  gap:       { fg: "var(--status-gap-fg)", bg: "var(--status-gap-bg)", bd: "var(--status-gap-border)", solid: "var(--status-gap-solid)" },
  uncertain: { fg: "var(--status-uncertain-fg)", bg: "var(--status-uncertain-bg)", bd: "var(--status-uncertain-border)", solid: "var(--status-uncertain-solid)" },
};

/**
 * QuadrantCard — one finding in the 2x2 evidence matrix. Carries the
 * quadrant label, a short title, the evidence source, rationale, and an
 * interview-focus prompt. This is the visual center of the report.
 */
export function QuadrantCard({ quadrant = "strong_with_evidence", title, source, rationale, interviewFocus, style }) {
  const q = QUAD[quadrant] || QUAD.strong_with_evidence;
  const c = TONE[q.tone];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "var(--space-4)",
        background: "var(--surface-card)",
        border: `1px solid var(--border-subtle)`,
        borderTop: `3px solid ${c.solid}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 8px",
            fontSize: "var(--text-2xs)",
            fontFamily: "var(--font-mono)",
            fontWeight: "var(--weight-semibold)",
            letterSpacing: "var(--tracking-label)",
            textTransform: "uppercase",
            color: c.fg,
            background: c.bg,
            border: `1px solid ${c.bd}`,
            borderRadius: "var(--radius-sm)",
          }}
        >
          {q.label}
        </span>
      </div>

      <h4 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)", lineHeight: "var(--leading-snug)" }}>
        {title}
      </h4>

      {source && (
        <Row label="Evidence">
          {source}
        </Row>
      )}
      {rationale && (
        <Row label="Rationale">
          {rationale}
        </Row>
      )}
      {interviewFocus && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            marginTop: 2,
            padding: "8px 10px",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Interview focus
          </span>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: "var(--leading-snug)" }}>
            {interviewFocus}
          </span>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>
        {children}
      </span>
    </div>
  );
}
