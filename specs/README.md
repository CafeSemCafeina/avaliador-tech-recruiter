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
| 001 | [Data contracts & report schema (the seam)](001-data-contracts-and-report-schema.md) | 0 | Implemented |
| 002 | [Analysis lifecycle API](002-analysis-lifecycle-api.md) | 1 | Implemented |
| 003 | [Mock analysis pipeline & stage events](003-mock-analysis-pipeline.md) | 1 | Implemented |
| 004 | [Report generation policy](004-report-generation-policy.md) | 1 | Implemented |
| 005 | [Markdown export](005-markdown-export.md) | 1 | Implemented |
| 006 | [Gemini text-agent pipeline](006-gemini-text-agent-pipeline.md) | 2 | Implemented |
| 007 | [GitHub-lite evidence ingestion](007-github-lite-evidence.md) | 3a | Implemented |
| 008 | [PDF text extraction](008-pdf-text-extraction.md) | 3b | Implemented |
| 009 | [Portfolio mini-crawler](009-portfolio-mini-crawler.md) | 3c | Implemented |
| 010 | [Tier 3 ingestion pipeline wiring](010-tier3-ingestion-pipeline-wiring.md) | 3 integration | Implemented |
| 011 | [PDF upload API and UI fill-in](011-pdf-upload-api.md) | 3 integration | Implemented |

Specs 001–005 cover the Tier 1 mock-mode floor ([EXECUTION_PLAN](../docs/EXECUTION_PLAN.md)). Spec 006 covers Tier 2 (real Gemini behind `LLMClient`). Specs 007–009 implement the Tier 3 evidence-ingestion packages: GitHub-lite, Go-native PDF text extraction, and the portfolio mini-crawler. Spec 010 wires the GitHub/portfolio ingestion packages into the real Gemini pipeline. Spec 011 exposes PDF extraction through upload/API and UI fill-in without changing the frozen analysis contract.
