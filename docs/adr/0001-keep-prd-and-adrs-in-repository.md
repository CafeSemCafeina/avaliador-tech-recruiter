# ADR 0001 - Keep PRD and ADRs in the repository

Status: Accepted  
Date: 2026-06-20

## Context

This project is not only a coding exercise. It is meant to show how a product idea is researched, scoped, designed, implemented, tested, and deployed under a short deadline.

If the PRD and decision records live outside the repository, reviewers see code but miss the reasoning that shaped it.

## Decision

Keep the PRD and Architecture Decision Records inside the repository under `docs/`.

The repository should show:

- what problem the product solves;
- what scope was intentionally selected;
- what trade-offs were made;
- what risks were considered;
- how the build can be validated.

## Alternatives considered

### Keep planning documents outside the repo

Rejected. It keeps the repository cleaner, but hides the product and engineering reasoning from recruiters and technical reviewers.

### Put everything in the README

Rejected. A README should be readable quickly. The PRD and ADRs need more depth.

## Consequences

Positive:

- reviewers can inspect product thinking and engineering judgment;
- the repository becomes a complete work sample;
- decisions are easier to audit later.

Negative:

- more documentation to maintain;
- docs can become stale if implementation changes.

## Validation

The README links to `docs/PRD.md` and `docs/adr/README.md`. Any material architecture or product scope change should update the relevant ADR or create a new one.

