import React from "react";

/**
 * Card — soft panel surface. The primary container for the analyzer.
 * tones: default (white), sunken (recessed), and quad tones tinted to status.
 */
export function Card({
  tone = "default",
  padding = "md",
  interactive = false,
  as = "div",
  children,
  style,
  ...rest
}) {
  const pads = { none: 0, sm: "var(--space-3)", md: "var(--space-4)", lg: "var(--space-6)" };

  const tones = {
    default: { background: "var(--surface-card)", border: "1px solid var(--border-subtle)" },
    sunken:  { background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)" },
    confirmed: { background: "var(--status-confirmed-bg)", border: "1px solid var(--status-confirmed-border)" },
    validate:  { background: "var(--status-validate-bg)", border: "1px solid var(--status-validate-border)" },
    gap:       { background: "var(--status-gap-bg)", border: "1px solid var(--status-gap-border)" },
    uncertain: { background: "var(--status-uncertain-bg)", border: "1px solid var(--status-uncertain-border)" },
  };
  const t = tones[tone] || tones.default;
  const Tag = as;

  return (
    <Tag
      style={{
        borderRadius: "var(--radius-lg)",
        padding: pads[padding] ?? pads.md,
        boxShadow: tone === "default" ? "var(--shadow-xs)" : "none",
        transition: "box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
        cursor: interactive ? "pointer" : "default",
        ...t,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
