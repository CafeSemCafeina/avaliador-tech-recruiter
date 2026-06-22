import React from "react";

/**
 * Textarea — multi-line input for job descriptions, pasted resume / LinkedIn
 * text, and recruiter notes. Optional character counter.
 */
export function Textarea({ rows = 6, invalid = false, value, maxLength, showCount = false, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const count = typeof value === "string" ? value.length : 0;

  return (
    <div style={{ position: "relative" }}>
      <textarea
        rows={rows}
        value={value}
        maxLength={maxLength}
        {...rest}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          width: "100%",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          lineHeight: "var(--leading-normal)",
          color: "var(--text-primary)",
          background: "var(--surface-card)",
          border: "1px solid",
          borderColor: invalid ? "var(--status-gap-solid)" : focused ? "var(--accent)" : "var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          resize: "vertical",
          outline: "none",
          boxShadow: focused ? "var(--shadow-focus)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
          ...style,
        }}
      />
      {showCount && maxLength && (
        <span
          style={{
            position: "absolute",
            right: 10,
            bottom: 8,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            color: "var(--text-muted)",
          }}
        >
          {count}/{maxLength}
        </span>
      )}
    </div>
  );
}
