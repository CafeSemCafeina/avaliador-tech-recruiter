import React from "react";

/**
 * Avatar — candidate / recruiter identity chip. Initials by default,
 * image when src is provided. Calm neutral fill.
 */
export function Avatar({ name = "", src = null, size = 36, style, ...rest }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "var(--radius-md)",
        background: src ? "transparent" : "var(--surface-sunken)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-mono)",
        fontSize: Math.max(11, Math.round(size * 0.36)),
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "0.02em",
        overflow: "hidden",
        flex: "none",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
