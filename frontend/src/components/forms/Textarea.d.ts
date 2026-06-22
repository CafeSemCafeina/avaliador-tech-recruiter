import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
  invalid?: boolean;
  showCount?: boolean;
}

/** Textarea — multi-line input for job descriptions, pasted text, notes. */
export function Textarea(props: TextareaProps): JSX.Element;
