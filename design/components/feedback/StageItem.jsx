import React from "react";

/**
 * StageItem — one row in the analysis-progress timeline.
 * States: pending · running · completed · warning · failed.
 * `last` removes the connector line below the node.
 */
export function StageItem({ state = "pending", title, detail, duration, last = false, style }) {
  const map = {
    pending:   { ring: "var(--border-default)", fill: "var(--surface-card)", text: "var(--text-muted)", icon: null },
    running:   { ring: "var(--accent)", fill: "var(--surface-card)", text: "var(--text-primary)", icon: "spin" },
    completed: { ring: "var(--status-confirmed-solid)", fill: "var(--status-confirmed-solid)", text: "var(--text-primary)", icon: "check" },
    warning:   { ring: "var(--status-validate-solid)", fill: "var(--status-validate-solid)", text: "var(--text-primary)", icon: "warn" },
    failed:    { ring: "var(--status-gap-solid)", fill: "var(--status-gap-solid)", text: "var(--text-primary)", icon: "x" },
  };
  const c = map[state] || map.pending;
  const filled = state === "completed" || state === "warning" || state === "failed";

  return (
    <div style={{ display: "flex", gap: 12, ...style }}>
      {/* node + connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
        <span
          style={{
            position: "relative",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `2px solid ${c.ring}`,
            background: filled ? c.fill : c.fill,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: filled ? "var(--text-inverse)" : c.ring,
          }}
        >
          {c.icon === "spin" && (
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                borderTopColor: "transparent",
                animation: "tma-spin 0.7s linear infinite",
              }}
            />
          )}
          {c.icon === "check" && <Glyph d="M3 7.2 5.6 10 11 3.6" />}
          {c.icon === "x" && <Glyph d="M3.5 3.5l7 7M10.5 3.5l-7 7" />}
          {c.icon === "warn" && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>!</span>
          )}
        </span>
        {!last && (
          <span
            style={{
              flex: 1,
              width: 2,
              minHeight: 22,
              marginTop: 2,
              background: filled ? "var(--status-confirmed-border)" : "var(--border-subtle)",
            }}
          />
        )}
      </div>

      {/* content */}
      <div style={{ paddingBottom: last ? 0 : 16, minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span
            style={{
              fontSize: "var(--text-base)",
              fontWeight: state === "running" ? "var(--weight-semibold)" : "var(--weight-medium)",
              color: c.text,
            }}
          >
            {title}
          </span>
          {duration && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-muted)", flex: "none" }}>
              {duration}
            </span>
          )}
        </div>
        {detail && (
          <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: "var(--leading-snug)" }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function Glyph({ d }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
