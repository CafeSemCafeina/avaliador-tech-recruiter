import React from "react";

/**
 * Field — label + control wrapper with optional hint, required mark,
 * and optional/required tag. Used by Input, Textarea, Select.
 */
export function Field({ label, htmlFor, hint, required = false, optional = false, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {(label || optional) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          {label && (
            <label
              htmlFor={htmlFor}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--text-primary)",
              }}
            >
              {label}
              {required && <span style={{ color: "var(--status-gap-solid)", marginLeft: 3 }}>*</span>}
            </label>
          )}
          {optional && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Optional
            </span>
          )}
        </div>
      )}
      {children}
      {hint && (
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "var(--leading-snug)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
