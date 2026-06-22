import React from "react";

export interface QualBadgeProps {
  label: string;
  value: React.ReactNode;
  tone?: "confirmed" | "validate" | "gap" | "uncertain" | "info" | "neutral";
  style?: React.CSSProperties;
}

/** QualBadge — labeled qualitative signal for the report header (never numeric). */
export function QualBadge(props: QualBadgeProps): JSX.Element;
