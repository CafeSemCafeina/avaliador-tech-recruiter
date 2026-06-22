import React from "react";

export interface TagProps {
  children?: React.ReactNode;
  /** Marks one of the up-to-3 primary stacks that guide analysis. */
  primary?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

/** Tag — stack / skill chip; mono, pill, optionally primary or removable. */
export function Tag(props: TagProps): JSX.Element;
