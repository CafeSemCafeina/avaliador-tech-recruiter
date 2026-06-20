import React from "react";

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Field — label/hint/required wrapper for form controls. */
export function Field(props: FieldProps): JSX.Element;
