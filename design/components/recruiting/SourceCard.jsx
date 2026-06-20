import React from "react";

/**
 * SourceCard — an evidence-input card on the candidate screen
 * (resume, LinkedIn export, GitHub, portfolio, notes). Shows a required
 * vs optional tag and an empty / filled state.
 */
export function SourceCard({
  icon = null,
  title,
  description,
  required = false,
  filled = false,
  meta,
  action,
  children,
  style,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "var(--space-4)",
        background: "var(--surface-card)",
        border: `1px solid ${filled ? "var(--status-confirmed-border)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {icon && (
          <span
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: filled ? "var(--status-confirmed-bg)" : "var(--surface-sunken)",
              color: filled ? "var(--status-confirmed-fg)" : "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {icon}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)" }}>
              {title}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: required ? "var(--status-gap-fg)" : "var(--text-muted)",
              }}
            >
              {required ? "Required" : "Optional"}
            </span>
          </div>
          {description && (
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-snug)" }}>
              {description}
            </p>
          )}
        </div>
        {filled && (
          <span aria-hidden style={{ flex: "none", color: "var(--status-confirmed-solid)", display: "inline-flex" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9.2 7.4 12.5 14 5.5" />
            </svg>
          </span>
        )}
      </div>

      {children}

      {(meta || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          {meta && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{meta}</span>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
