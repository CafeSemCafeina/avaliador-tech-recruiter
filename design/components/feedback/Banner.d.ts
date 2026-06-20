import React from "react";

export interface BannerProps {
  tone?: "info" | "validate" | "neutral";
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Banner — calm inline privacy / info / methodology notice. */
export function Banner(props: BannerProps): JSX.Element;
