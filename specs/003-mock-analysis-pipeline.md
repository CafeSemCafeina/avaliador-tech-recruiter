# Spec 003: Mock analysis pipeline & stage events

- **Tier:** 1
- **Status:** Draft
- **Related to:** PRD §8 (step 3), §11; TECHNICAL_DESIGN §2, §7; ADR-0003; ADR-0011; EVALUATION L2
- **Estimate:** M
- **Owner engine:** orchestrator (defines the pipeline interface other tiers extend)
- **Partition (paths this spec owns):** Go pipeline package (e.g. `backend/internal/pipeline/`)
- **Depends on:** spec 001

## Objective

Implement the controlled, ordered pipeline as an interface plus a deterministic `mock` implementation that emits the ten progress stages and produces a complete `Report` from the inputs without any external calls. This is the default `ANALYSIS_MODE=mock` and the protected Tier 1 floor; the `gemini` implementation (Tier 2) plugs into the same interface behind `LLMClient`.

## Non-objectives

- Real LLM/GitHub/PDF calls (Tier 2+; this implementation must not make them).
- Report content policy enforcement (spec 004 owns the L1 checks; this spec produces a report that satisfies them).

## Technical context

- The pipeline is a fixed sequence, not autonomous (ADR-0003). Nine agents (PRD §11): `JobProfileAgent → ResumeEvidenceAgent → LinkedInEvidenceAgent → GitHubEvidenceAgent → PortfolioEvidenceAgent → EvidenceCheckerAgent → QuadrantClassifierAgent → STARQuestionAgent → TechnicalMaturityAnalystAgent`.
- The progress UI shows ten stages (PRD §8 step 3): parsing resume; extracting role maturity profile; reading LinkedIn evidence; analyzing GitHub repositories; reading portfolio signals; checking claims against evidence; building evidence matrix; generating STAR questions; running analyst self-review; finalizing report. The runner (spec 002) consumes the stage events this pipeline emits.
- Mode selection by `ANALYSIS_MODE` (TECHNICAL_DESIGN §2); not exposed in the UI.
- The pipeline exposes a Go interface (e.g. `Pipeline.Run(ctx, JobInput, CandidateInput, emit func(StageEvent)) (Report, error)`); the runner in spec 002 depends only on this interface.
- Mock output is deterministic for a given input (stable ordering, fixed text), so L2 fixtures can assert exact structure.

## Acceptance criteria

- **AC1** [L2] Given any valid input in `mock` mode, when `Run` executes, then it emits exactly the ten stages in order, each transitioning pending → running → completed/warning, and returns a `Report` valid against spec 001.
- **AC2** [L2] Given the same input twice, the mock produces identical reports (determinism).
- **AC3** [L2] Given the golden fixtures (EVALUATION L2), the mock report exhibits the expected per-fixture properties — e.g. an unsourced item lands in a `*_needs_validation` quadrant, never `weak_with_evidence`.
- **AC4** [L0] The mock makes no network/model calls (verified by injecting a forbidden transport that fails the test if used).
- **AC5** The pipeline depends only on the contract types (spec 001) and the `LLMClient` interface, so the `gemini` implementation is a drop-in.

## Tasks

- [ ] Define the `Pipeline` interface and the `StageEvent` type (aligned with TECHNICAL_DESIGN §4).
- [ ] Define the `LLMClient` interface (used by gemini later; mock needs no real client).
- [ ] Implement the deterministic mock pipeline emitting all ten stages.
- [ ] Produce a complete mock `Report` covering every section, with sourced quadrant items.
- [ ] [P] Add L2 golden fixtures (fictitious job+candidate) with expected properties.
- [ ] [P] Add the "no external calls" guard test (AC4).

## Done when

`go test ./...` passes the L2 fixture and determinism tests and the no-external-calls guard for the mock pipeline.
