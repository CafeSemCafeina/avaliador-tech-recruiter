import React from "react";

export interface SegmentedOption { value: string; label: string; }

export interface SegmentedControlProps {
  options: Array<string | SegmentedOption>;
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

/** SegmentedControl — inline single-select; used for the seniority baseline. */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
