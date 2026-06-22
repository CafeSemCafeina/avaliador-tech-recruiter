import React from "react";

/**
 * QuadrantCard props.
 * @startingPoint section="Recruiting" subtitle="Evidence matrix finding card" viewport="520x280"
 */
export interface QuadrantCardProps {
  quadrant?:
    | "strong_with_evidence"
    | "strong_needs_validation"
    | "weak_with_evidence"
    | "weak_needs_validation";
  title: string;
  source?: React.ReactNode;
  rationale?: React.ReactNode;
  interviewFocus?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * QuadrantCard — one finding in the 2x2 evidence matrix.
 * @startingPoint section="Recruiting" subtitle="Evidence matrix finding card" viewport="520x280"
 */
export function QuadrantCard(props: QuadrantCardProps): JSX.Element;
