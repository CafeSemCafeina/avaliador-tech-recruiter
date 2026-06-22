import React from "react";

/**
 * StarQuestion — a copy-friendly STAR interview question with optional
 * follow-ups and a "what a good answer reveals" note.
 */
export function StarQuestion({ index, question, followUps = [], reveals, style }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const text = [
      question,
      followUps.length ? "\nFollow-ups:\n" + followUps.map((f) => `- ${f}`).join("\n") : "",
    ].join("");
    try {
      navigator.clipboard?.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {}
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "var(--space-4)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {index != null && (
          <span
            style={{
              flex: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-muted)",
              lineHeight: "var(--leading-snug)",
              minWidth: 22,
            }}
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
        <p style={{ margin: 0, fontSize: "var(--text-md)", color: "var(--text-primary)", lineHeight: "var(--leading-normal)", flex: 1 }}>
          {question}
        </p>
        <button
          onClick={copy}
          aria-label="Copy question"
          style={{
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 28,
            padding: "0 10px",
            border: "1px solid var(--border-default)",
            background: "var(--surface-card)",
            borderRadius: "var(--radius-sm)",
            color: copied ? "var(--status-confirmed-fg)" : "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--weight-medium)",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {followUps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: index != null ? 34 : 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Follow-ups
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {followUps.map((f, i) => (
              <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-snug)" }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {reveals && (
        <div style={{ paddingLeft: index != null ? 34 : 0, fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "var(--leading-snug)" }}>
          <span style={{ fontWeight: "var(--weight-medium)", color: "var(--text-secondary)" }}>A good answer reveals: </span>
          {reveals}
        </div>
      )}
    </div>
  );
}
