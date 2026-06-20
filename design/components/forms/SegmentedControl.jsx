import React from "react";

/**
 * SegmentedControl — single-select inline switch. Used for the
 * seniority baseline (Intern · Junior · Mid · Senior · Staff).
 */
export function SegmentedControl({ options = [], value, onChange, size = "md", style }) {
  const heights = { sm: 30, md: 36 };
  const h = heights[size] || heights.md;

  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}
    >
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(val)}
            style={{
              height: h - 6,
              padding: "0 12px",
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: active ? "var(--surface-card)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
              boxShadow: active ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
