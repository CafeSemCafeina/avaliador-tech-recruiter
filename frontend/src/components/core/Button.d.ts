import React from "react";

/**
 * Button props.
 * @startingPoint section="Core" subtitle="Action buttons in all variants" viewport="700x140"
 */
export interface ButtonProps {
  /** Visual style. */
  variant?: "primary" | "accent" | "secondary" | "subtle" | "ghost" | "danger-quiet";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Button — primary action control.
 * @startingPoint section="Core" subtitle="Action buttons in all variants" viewport="700x140"
 */
export function Button(props: ButtonProps): JSX.Element;
