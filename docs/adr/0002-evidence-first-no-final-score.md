# ADR 0002 - Use evidence-first analysis without a final score

Status: Accepted  
Date: 2026-06-20

## Context

Recruiting tools often collapse candidate fit into a percentage or score. That is fast, but it can hide uncertainty and create a false sense of objectivity.

This product is intended to support human screening, not replace it. The key value is organizing evidence, uncertainty, and interview priorities.

## Decision

Do not produce a final numeric score, match percentage, or automatic hiring verdict.

The report will use:

- qualitative badges;
- a four-quadrant evidence matrix;
- source-backed findings;
- caveats;
- STAR interview questions.

The four quadrants are:

1. Strong with evidence.
2. Strong but needs validation.
3. Weak with evidence.
4. Weak but needs validation.

## Alternatives considered

### Single maturity score

Rejected. It is easy to understand, but it oversimplifies evidence and can look like an automated hiring decision.

### Multiple numeric sub-scores

Rejected for the MVP. Sub-scores are less harmful than a final score, but still invite overinterpretation. They can be revisited later if clearly labeled as signals, not verdicts.

### Qualitative badges plus evidence matrix

Accepted. It keeps the output recruiter-friendly while preserving nuance.

## Consequences

Positive:

- aligns with human-reviewed recruiting;
- makes uncertainty visible;
- turns gaps into interview questions;
- reduces risk of unfair automated conclusions.

Negative:

- less immediately "dashboard-like";
- requires better writing and clearer evidence organization.

## Validation

Reports must not include final scores or rankings. Tests and prompt review should check for score-like language such as "match percentage", "hire/no-hire", or unsupported verdicts.

