# Specs - implementation contracts

This directory holds the **spec layer**: per-unit behavioral contracts derived from the [PRD](../docs/PRD.md) and [Technical Design](../docs/TECHNICAL_DESIGN.md), citing the [ADRs](../docs/adr/README.md) as constraints. Rationale and format are recorded in [ADR 0014](../docs/adr/0014-spec-layer-implementation-contracts.md).

A spec defines **behavior**, not decisions. It is the precondition for coding its unit and the unit of partition for the agent swarm ([ADR 0013](../docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md)). Each spec's acceptance criteria map to the evaluation gates in [EVALUATION.md](../docs/EVALUATION.md), so **spec ⇒ test ⇒ gate ⇒ merge** is one chain.

## How to use

1. Write/read the spec before implementing its unit. No package is coded before its spec is `Ready`.
2. Hand a `Ready` spec to a worker as a self-contained work order (it names owner engine + partition-safe paths).
3. A change merges only when its spec's `Done when` eval command passes on the integration branch.
4. When the PRD/TD/ADRs change, update the affected specs in the same change.

## Status values

`Draft` (under authoring/review) · `Ready` (approved, implementable) · `In progress` · `Implemented`

## Index

| # | Spec | Tier | Status |
| --- | --- | --- | --- |
| 000 | [Template](000-template.md) | — | — |
| 001 | [Data contracts & report schema (the seam)](001-data-contracts-and-report-schema.md) | 0 | Draft |
| 002 | [Analysis lifecycle API](002-analysis-lifecycle-api.md) | 1 | Draft |
| 003 | [Mock analysis pipeline & stage events](003-mock-analysis-pipeline.md) | 1 | Draft |
| 004 | [Report generation policy](004-report-generation-policy.md) | 1 | Draft |
| 005 | [Markdown export](005-markdown-export.md) | 1 | Draft |

Specs 001–005 cover the Tier 1 mock-mode floor ([EXECUTION_PLAN](../docs/EXECUTION_PLAN.md)). Per-agent specs for real (Gemini) mode and the evidence ingestion units (GitHub, Docling, portfolio) are added at Tier 2+.
