# Spec 006: Gemini text-agent pipeline

- **Tier:** 2
- **Status:** Implemented (offline AC1–AC6 green; AC7 live smoke pending — verified the key/models are reachable and graceful degradation works end to end, but real LLM reasoning is unverified because the Gemini account's prepay credits are exhausted: all `generateContent` calls return 429)
- **Related to:** PRD §11; TECHNICAL_DESIGN §2, §7; ADR-0002; ADR-0003; ADR-0011; EVALUATION L0/L1/L2/L3; EXECUTION_PLAN Tier 2
- **Estimate:** L
- **Owner engine:** orchestrator (defines the real agent layer + prompts) with codex/gemini workers per agent
- **Partition (paths this spec owns):** `backend/internal/llm/` (Gemini client), `backend/internal/pipeline/gemini*.go` and `backend/internal/pipeline/prompts/`; `cmd/server` mode wiring (additive)
- **Depends on:** spec 001, spec 003, spec 004

## Objective

Add the first real reasoning behind the existing `LLMClient`/`Pipeline` seams: a `gemini` pipeline selected by `ANALYSIS_MODE=gemini` that drives the **text-only** agents with Gemini and produces a `Report` that passes the **same** eval gates as mock mode. This is the first real external dependency; it is added behind a documented fallback (ADR-0011) and never runs in the default test suite.

## Non-objectives

- Real evidence ingestion (LinkedIn/GitHub/Portfolio agents stay on the mock in Tier 2; real ingestion is Tier 3). The gemini pipeline operates on pasted resume text + the job description.
- The ADK spike (separate, timeboxed, off the critical path per EXECUTION_PLAN cut line; this spec uses the Gemini Go SDK via `LLMClient`).
- Changing the contracts, the policy validator, or the mock pipeline (all frozen/owned by 001/004/003).

## Technical context

- **Provider/seam:** Gemini Go SDK wrapped by a concrete `LLMClient` (`internal/llm`), satisfying the existing `pipeline.LLMClient` interface (no import cycle — structural). The `gemini` `Pipeline` depends only on `LLMClient` + the contract types, so it is a drop-in alongside the mock (ADR-0011).
- **Two-tier models (ADR-0011):** a fast model for extraction/summarization, a stronger model for evidence checking, quadrant classification, and the final analyst. Both configurable: `GEMINI_MODEL_FAST`, `GEMINI_MODEL_STRONG`.
- **Backend selection (ADR-0011 update):** two genai backends behind the same `LLMClient`. Default **Vertex AI** (`GOOGLE_GENAI_USE_VERTEXAI=true`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` default `global`; ADC auth) so the GCP Free Trial credit applies; **Gemini Developer API** (`GOOGLE_API_KEY`) when Vertex is off.
- **Hybrid pipeline:** the ten stages still emit in order (spec 003). Text agents (`JobProfileAgent`, `ResumeEvidenceAgent`, `EvidenceCheckerAgent`, `QuadrantClassifierAgent`, `TechnicalMaturityAnalystAgent`) call Gemini; the ingestion stages (`LinkedIn/GitHub/Portfolio`) reuse the mock behavior until Tier 3.
- **Structured output:** each agent prompt requests JSON matching the relevant contract fragment; the agent parses it into the contract types. Malformed/again-invalid output triggers the agent's fallback.
- **Policy is injected, not duplicated:** every agent prompt embeds the evidence policy and the forbidden-vocabulary list loaded from the single shared source (`eval.ForbiddenVocabulary`) so prompt and check never diverge (CLAUDE.md, spec 004).
- **Per-agent mock fallback:** if an agent's LLM call errors or returns unparseable/again-non-compliant output, that agent falls back to its deterministic mock output; the run still completes with a valid, compliant report, and the degradation is recorded (stage `warning` + a limitations note). A single provider failure never breaks the run.
- **Tests are offline:** the gemini pipeline is exercised with a fake `LLMClient` returning canned responses; no live calls in `go test` (ADR-0009, ADR-0011 adoption criterion). Live verification is manual/nightly (EVALUATION L3).

## Acceptance criteria

- **AC1** [L0] Given a fake `LLMClient` returning well-formed agent JSON, when the gemini pipeline runs, then it emits the ten stages in order and returns a `Report` valid against spec 001.
- **AC2** [L1] Given compliant fake outputs, the resulting report passes `eval.Validate` with zero violations (conservative prompts + injected policy).
- **AC3** [L2] Given the golden fixtures, gemini-mode output (with deterministic fake `LLMClient`) exhibits the expected per-fixture **properties** and all L0/L1 invariants, tolerating wording variance (EVALUATION L2 real-mode rule).
- **AC4** [L0] No network/model calls occur in the default test suite (verified by the no-network guard; the real client is never constructed in tests).
- **AC5** Given an agent whose LLM call errors (or returns unparseable output), when the pipeline runs, then that agent falls back to mock output, the stage is marked `warning`, and the final report is still valid and compliant.
- **AC6** The forbidden-vocabulary/evidence policy embedded in the agent prompts is loaded from the single shared source — no second copy in the repo.
- **AC7** [L3, manual] With a real `GOOGLE_API_KEY`, `ANALYSIS_MODE=gemini` produces a report from pasted resume + job text that passes L0/L1 (run manually/nightly, never in CI).

## Tasks

- [ ] `internal/llm`: Gemini client implementing `pipeline.LLMClient`, two-tier model selection, `GOOGLE_API_KEY`, timeouts/retries.
- [ ] Agent prompt templates (`prompts/`) embedding the injected evidence policy + per-agent JSON output schema.
- [ ] `gemini` `Pipeline`: ordered text agents calling the client and parsing structured output into contract types; ingestion stages reuse mock behavior.
- [ ] Per-agent mock fallback with `warning` stage + limitations note (AC5).
- [ ] Wire `ANALYSIS_MODE=gemini` in `cmd/server` (replace the current mock fallback log).
- [ ] [P] Tests with a fake `LLMClient`: AC1–AC5 (valid report, policy pass, golden properties, no-network guard, fallback path).
- [ ] [P] Test that the policy text in prompts comes from `eval.ForbiddenVocabulary` (AC6).
- [ ] Document env (`GOOGLE_API_KEY`, `GEMINI_MODEL_FAST`, `GEMINI_MODEL_STRONG`) and the manual L3 smoke (AC7) in the README/CLAUDE commands.

## Done when

`go test ./...` passes AC1–AC6 with a fake client and the no-network guard (default suite stays offline), and a documented manual run of `ANALYSIS_MODE=gemini` (AC7) produces an L0/L1-passing report. If the ADK spike is later run, its result is recorded in ADR-0011.
