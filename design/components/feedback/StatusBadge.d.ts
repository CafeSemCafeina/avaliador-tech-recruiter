import React from "react";

/**
 * StatusBadge props.
 * @startingPoint section="Feedback" subtitle="Qualitative status chips" viewport="700x120"
 */
export interface StatusBadgeProps {
  /** Maps to the analyzer's muted status palette. */
  tone?: "confirmed" | "validate" | "gap" | "uncertain" | "info" | "neutral";
  variant?: "soft" | "outline" | "solid";
  dot?: boolean;
  size?: "sm" | "md";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * StatusBadge — restrained qualitative status chip.
 * @startingPoint section="Feedback" subtitle="Qualitative status chips" viewport="700x120"
 */
export function StatusBadge(props: StatusBadgeProps): JSX.Element;
