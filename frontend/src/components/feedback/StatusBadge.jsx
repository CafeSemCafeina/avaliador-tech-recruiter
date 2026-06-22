import React from "react";

/**
 * StatusBadge — restrained qualitative chip. The vocabulary of the
 * analyzer: confirmed / validate / gap / uncertain / info / neutral.
 * Careful wording lives in `children`; tone sets the muted color.
 */
export function StatusBadge({ tone = "neutral", variant = "soft", dot = true, size = "md", children, style }) {
  const map = {
    confirmed: { fg: "var(--status-confirmed-fg)", bg: "var(--status-confirmed-bg)", bd: "var(--status-confirmed-border)", solid: "var(--status-confirmed-solid)" },
    validate:  { fg: "var(--status-validate-fg)", bg: "var(--status-validate-bg)", bd: "var(--status-validate-border)", solid: "var(--status-validate-solid)" },
    gap:       { fg: "var(--status-gap-fg)", bg: "var(--status-gap-bg)", bd: "var(--status-gap-border)", solid: "var(--status-gap-solid)" },
    uncertain: { fg: "var(--status-uncertain-fg)", bg: "var(--status-uncertain-bg)", bd: "var(--status-uncertain-border)", solid: "var(--status-uncertain-solid)" },
    info:      { fg: "var(--status-info-fg)", bg: "var(--status-info-bg)", bd: "var(--status-info-border)", solid: "var(--status-info-solid)" },
    neutral:   { fg: "var(--text-secondary)", bg: "var(--surface-sunken)", bd: "var(--border-subtle)", solid: "var(--neutral-400)" },
  };
  const c = map[tone] || map.neutral;
  const pad = size === "sm" ? "2px 8px" : "3px 10px";
  const font = size === "sm" ? "var(--text-2xs)" : "var(--text-xs)";

  const styles =
    variant === "outline"
      ? { background: "transparent", color: c.fg, border: `1px solid ${c.bd}` }
      : variant === "solid"
      ? { background: c.solid, color: "var(--text-inverse)", border: `1px solid ${c.solid}` }
      : { background: c.bg, color: c.fg, border: `1px solid ${c.bd}` };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: pad,
        fontFamily: "var(--font-sans)",
        fontSize: font,
        fontWeight: "var(--weight-medium)",
        lineHeight: 1.3,
        borderRadius: "var(--radius-sm)",
        whiteSpace: "nowrap",
        ...styles,
        ...style,
      }}
    >
      {dot && variant !== "solid" && (
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: c.solid, flex: "none" }} />
      )}
      {children}
    </span>
  );
}
