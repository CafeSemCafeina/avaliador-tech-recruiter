import React from "react";

const baseControl = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-base)",
  color: "var(--text-primary)",
  background: "var(--surface-card)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
  outline: "none",
};

/**
 * Input — single-line text/number/url field. Leading adornment optional.
 */
export function Input({ size = "md", invalid = false, leading = null, style, ...rest }) {
  const heights = { sm: 30, md: 36, lg: 44 };
  const [focused, setFocused] = React.useState(false);

  const control = (
    <input
      {...rest}
      onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
      style={{
        ...baseControl,
        height: heights[size] || heights.md,
        padding: leading ? "0 12px 0 34px" : "0 12px",
        borderColor: invalid ? "var(--status-gap-solid)" : focused ? "var(--accent)" : "var(--border-default)",
        boxShadow: focused ? "var(--shadow-focus)" : "none",
        ...style,
      }}
    />
  );

  if (!leading) return control;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <span style={{ position: "absolute", left: 11, display: "inline-flex", color: "var(--text-muted)", pointerEvents: "none" }}>
        {leading}
      </span>
      {control}
    </div>
  );
}
