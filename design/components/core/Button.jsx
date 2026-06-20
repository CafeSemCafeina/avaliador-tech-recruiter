import React from "react";

/**
 * Button — primary action control for the analyzer.
 * Variants: primary (ink), accent (calm blue), secondary (outline),
 * ghost (text), subtle (tinted), danger-quiet (muted clay).
 */
export function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leadingIcon = null,
  trailingIcon = null,
  type = "button",
  onClick,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: { padding: "0 10px", height: 30, font: "var(--text-sm)", gap: 6, radius: "var(--radius-sm)" },
    md: { padding: "0 14px", height: 36, font: "var(--text-base)", gap: 8, radius: "var(--radius-md)" },
    lg: { padding: "0 18px", height: 44, font: "var(--text-md)", gap: 8, radius: "var(--radius-md)" },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: "var(--surface-inverse)",
      color: "var(--text-inverse)",
      border: "1px solid var(--surface-inverse)",
    },
    accent: {
      background: "var(--accent)",
      color: "var(--text-inverse)",
      border: "1px solid var(--accent)",
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)",
    },
    subtle: {
      background: "var(--surface-sunken)",
      color: "var(--text-primary)",
      border: "1px solid transparent",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
    },
    "danger-quiet": {
      background: "var(--status-gap-bg)",
      color: "var(--status-gap-fg)",
      border: "1px solid var(--status-gap-border)",
    },
  };
  const v = variants[variant] || variants.secondary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-sans)",
        fontSize: s.font,
        fontWeight: "var(--weight-medium)",
        lineHeight: 1,
        letterSpacing: "var(--tracking-normal)",
        borderRadius: s.radius,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        ...v,
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && leadingIcon}
      {children && <span>{children}</span>}
      {!loading && trailingIcon}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 13,
        height: 13,
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        opacity: 0.85,
        animation: "tma-spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
