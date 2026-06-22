import React from "react";

export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  style?: React.CSSProperties;
}

/** Avatar — identity chip with initials or image, square-rounded. */
export function Avatar(props: AvatarProps): JSX.Element;
