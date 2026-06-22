import React from "react";

export interface StageItemProps {
  state?: "pending" | "running" | "completed" | "warning" | "failed";
  title: string;
  detail?: string;
  /** Mono duration label, e.g. "1.4s". */
  duration?: string;
  /** Hide the connector line below the node (final stage). */
  last?: boolean;
  style?: React.CSSProperties;
}

/** StageItem — one row of the analysis-progress timeline. */
export function StageItem(props: StageItemProps): JSX.Element;
