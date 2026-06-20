import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  leading?: React.ReactNode;
}

/** Input — single-line field with focus ring and optional leading adornment. */
export function Input(props: InputProps): JSX.Element;
