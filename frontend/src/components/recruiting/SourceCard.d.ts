import React from "react";

export interface SourceCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  required?: boolean;
  /** Switches to the "evidence provided" state (green border + check). */
  filled?: boolean;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** SourceCard — an evidence-input card on the candidate screen. */
export function SourceCard(props: SourceCardProps): JSX.Element;
