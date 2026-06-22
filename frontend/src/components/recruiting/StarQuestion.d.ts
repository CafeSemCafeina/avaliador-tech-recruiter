import React from "react";

export interface StarQuestionProps {
  index?: number;
  question: string;
  followUps?: string[];
  reveals?: React.ReactNode;
  style?: React.CSSProperties;
}

/** StarQuestion — copy-friendly STAR question with follow-ups. */
export function StarQuestion(props: StarQuestionProps): JSX.Element;
