# ADR 0014 - Add a spec layer as implementation contracts between decisions and code

Status: Accepted  
Date: 2026-06-20

## Context

The repository has a strong constitution (`CLAUDE.md` + the no-score constraints + the eval gates), product requirements ([PRD](../PRD.md)), architecture decisions (ADRs 0001–0013), and a project-level plan ([TECHNICAL_DESIGN](../TECHNICAL_DESIGN.md), [EXECUTION_PLAN](../EXECUTION_PLAN.md)). What is missing is the layer that current spec-driven development (SDD) practice treats as the actual implementation contract: a **per-unit behavioral spec** stating external behavior — input/output mappings, pre/postconditions, invariants, interface contracts, and testable acceptance criteria.

PRDs capture business outcomes and ADRs capture decisions; neither is machine-checkable behavior an agent can implement and test without guessing. Building straight from the PRD + ADRs leaves that interpretation gap to each worker — exactly the failure mode (intent drift) the spec layer exists to close, and the risk is higher here because the build is parallelized across specialist agents ([ADR 0013](0013-hybrid-orchestrator-specialist-agent-workflow.md)).

## Decision

Add a `specs/` layer of implementation contracts, using the project's own hand-rolled spec format (proven in the `kommo-mcp-server` repo), upgraded so that each spec's acceptance criteria map to the evaluation gates in [EVALUATION.md](../EVALUATION.md).

Rules:

1. **Specs are derived, not converted.** A spec is written from the PRD/TD and **cites** the relevant ADRs as constraints (`Related to: PRD §…; ADR-…`). ADRs are not rewritten into specs — they remain narrative decision records. The two artifact types coexist.
2. **A spec defines behavior, not decisions.** Objective, non-objectives, technical context (contracts/endpoints/files), Given/When/Then acceptance criteria, atomic tasks, and an explicit "done when" eval command.
3. **Acceptance criteria are wired to the gates.** Each criterion is tagged with the eval layer that verifies it (L0 contract / L1 policy / L2 fixtures), so spec ⇒ test ⇒ gate ⇒ merge is one chain.
4. **Specs are the unit of partition for the swarm.** Each spec names an owner engine and partition-safe paths, making it directly hand-offable as a work order under [ADR 0013](0013-hybrid-orchestrator-specialist-agent-workflow.md).
5. **A spec is the precondition for coding its unit.** No package is implemented before its spec is `Ready`. The contract-seam spec is written and frozen first (Tier 0).

The template lives at `specs/000-template.md`; the index and conventions at `specs/README.md`.

## Alternatives considered

### Adopt GitHub Spec Kit tooling

Rejected for this project. Spec Kit is a solid standard, but it adds a dependency and its own command/template flow, while the team already has a proven hand-rolled format that fits this repo's conventions. The concepts (constitution → spec → plan → tasks, EARS/Given-When-Then acceptance) are adopted; the tooling is not.

### No spec layer — code from PRD + ADRs directly

Rejected. This is the current gap. It leaves behavior under-specified and pushes interpretation onto each (parallel) worker, which is precisely where intent drift enters.

### Turn the ADRs into specs

Rejected. It conflates two artifact types: ADRs record *why a decision was made* (narrative, durable); specs record *what behavior to build* (machine-checkable, per-unit). Merging them loses the decision history and produces specs cluttered with rationale.

## Consequences

Positive:

- closes the decision-to-code gap with testable contracts;
- gives the swarm partition-safe, self-contained work orders;
- makes "done" objective via the spec ⇒ gate chain;
- keeps ADRs clean as decision history.

Negative:

- up-front authoring effort before Tier 0 coding;
- specs must be kept in sync with the PRD/TD/ADRs they cite (same sync discipline already applied to the docs);
- a weak or stale spec misleads every worker that implements against it.

## Validation

- `specs/` exists with a template and the contract-seam spec marked `Ready` before Tier 0 implementation begins.
- Every implemented package traces to a spec; every spec's acceptance criteria resolve to concrete eval-gate checks.
- When the PRD/TD/ADRs change, the affected specs are updated in the same change.
