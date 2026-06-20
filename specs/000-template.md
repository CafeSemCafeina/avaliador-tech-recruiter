# Spec NNN: <Title>

- **Tier:** <0–4, from EXECUTION_PLAN>
- **Status:** Draft | Ready | In progress | Implemented
- **Related to:** PRD §…; TECHNICAL_DESIGN §…; ADR-…
- **Estimate:** S | M | L
- **Owner engine:** orchestrator | gemini | codex | small-model (per ADR 0013)
- **Partition (paths this spec owns):** `path/…` — do not touch outside these.
- **Depends on:** spec NNN (if any)

## Objective

One paragraph: what behavior this unit delivers and why it exists. Behavior, not decisions.

## Non-objectives

What this spec deliberately excludes (deferred to another spec/tier).

## Technical context

Contracts, endpoints, data shapes, files, and dependencies the implementer needs. Reference the canonical source (PRD/TD section) rather than restating it; add only the detail needed to implement without guessing.

## Acceptance criteria

Given/When/Then statements, each tagged with the eval gate that verifies it. Every criterion must be testable.

- **AC1** [L0] Given …, when …, then ….
- **AC2** [L1] Given …, when …, then ….
- **AC3** [L2] Given …, when …, then ….

## Tasks

Atomic, ordered. Mark independent tasks `[P]` (parallelizable).

- [ ] …
- [ ] …

## Done when

The exact eval/test command(s) that must pass on the integration branch for this spec to be `Implemented` (the merge filter from ADR 0013).
