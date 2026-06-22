import React from "react";

export interface CardProps {
  tone?: "default" | "sunken" | "confirmed" | "validate" | "gap" | "uncertain";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Card — soft panel surface; the primary container. */
export function Card(props: CardProps): JSX.Element;
