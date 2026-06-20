import React from "react";

/**
 * Tag — stack / skill chip. Can be marked `primary` (one of up to 3
 * primary stacks that guide the analysis) and optionally removable.
 */
export function Tag({ children, primary = false, removable = false, onRemove, onClick, size = "md", style }) {
  const pad = size === "sm" ? "2px 8px" : "4px 10px";
  const font = size === "sm" ? "var(--text-xs)" : "var(--text-sm)";

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: pad,
        fontFamily: "var(--font-mono)",
        fontSize: font,
        fontWeight: "var(--weight-medium)",
        lineHeight: 1.4,
        borderRadius: "var(--radius-pill)",
        cursor: onClick ? "pointer" : "default",
        background: primary ? "var(--accent-subtle)" : "var(--surface-sunken)",
        color: primary ? "var(--accent-active)" : "var(--text-secondary)",
        border: primary ? "1px solid var(--blue-200)" : "1px solid var(--border-subtle)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {primary && (
        <span
          aria-hidden
          style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", flex: "none" }}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          aria-label="Remove"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            marginRight: -2,
            border: "none",
            background: "transparent",
            color: "currentColor",
            opacity: 0.6,
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
