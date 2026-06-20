import React from "react";

/**
 * Banner — calm inline info / privacy / warning notice. Used for the
 * "files processed for this analysis only" privacy note and the
 * "does not make a hiring decision" methodology note.
 */
export function Banner({ tone = "info", icon = null, title, children, style }) {
  const map = {
    info:    { fg: "var(--status-info-fg)", bg: "var(--status-info-bg)", bd: "var(--status-info-border)" },
    validate:{ fg: "var(--status-validate-fg)", bg: "var(--status-validate-bg)", bd: "var(--status-validate-border)" },
    neutral: { fg: "var(--text-secondary)", bg: "var(--surface-sunken)", bd: "var(--border-subtle)" },
  };
  const c = map[tone] || map.info;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: c.bg,
        border: `1px solid ${c.bd}`,
        borderRadius: "var(--radius-md)",
        ...style,
      }}
    >
      {icon && <span style={{ color: c.fg, flex: "none", display: "inline-flex", marginTop: 1 }}>{icon}</span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        {title && (
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: c.fg }}>{title}</span>
        )}
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-snug)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
