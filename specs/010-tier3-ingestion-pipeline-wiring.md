# Spec 010: Tier 3 ingestion pipeline wiring

- **Tier:** 3 integration
- **Status:** Implemented
- **Related to:** PRD §11.4, §11.5, §15, §16; TECHNICAL_DESIGN §7, §10, §11, §15; ADR-0002; ADR-0003; ADR-0009; ADR-0011; ADR-0017; EXECUTION_PLAN Tier 3
- **Estimate:** M
- **Owner engine:** orchestrator
- **Partition (paths this spec owns):** `backend/internal/pipeline/gemini*.go`, `backend/internal/pipeline/prompts/`, `backend/cmd/server/main.go`, `backend/.env.example`, `README.md`, `specs/010-tier3-ingestion-pipeline-wiring.md`, and `specs/README.md`. It consumes but does not redefine `backend/internal/ingest/github/`, `backend/internal/ingest/portfolio/`, or `backend/internal/ingest/pdf/`.
- **Depends on:** spec 001, spec 004, spec 006, spec 007, spec 008, spec 009

## Objective

Wire the implemented Tier 3 ingestion packages into the real `gemini` pipeline so the `github_evidence` and `portfolio_evidence` stages feed concrete public sources and summaries into downstream evidence checking. Missing, unreachable, rate-limited, or empty public evidence must degrade to conservative "not publicly evidenced" context and never break the analysis or become a candidate gap.

## Non-objectives

- GitHub code sampling (EXECUTION_PLAN cut line).
- Deep portfolio crawling, JS rendering, or arbitrary link following.
- PDF upload/API/UI wiring; this spec records that spec 008 is ready for the next upload slice but does not expose uploads.
- Changing frozen contracts or policy validation.
- Live GitHub, portfolio, Gemini, or cloud calls in the default test suite.

## Technical context

- Spec 006 currently leaves `linkedin_evidence`, `github_evidence`, and `portfolio_evidence` as mocked stages in `GeminiPipeline`. This spec only replaces GitHub and portfolio mocked behavior with real ingestion packages when URLs are present.
- The pipeline must keep the same ten stages and the same `Pipeline` interface. Mock mode remains unchanged and makes no network calls.
- `GitHubEvidenceAgent` consumes `CandidateInput.GithubURL` through `ingest/github.Fetch(ctx, url, token)`. The token comes from `GITHUB_TOKEN`, wired in `cmd/server` when `ANALYSIS_MODE=gemini`.
- `PortfolioEvidenceAgent` consumes `CandidateInput.PortfolioURL` through `ingest/portfolio.Fetch(ctx, url, opts)`.
- Downstream prompts must receive a compact serialized evidence context containing `[]contract.Source` and qualitative summaries. They must not receive raw HTML, raw repository file content, credentials, or numeric fit values.
- Tests inject fake ingestion functions/clients so the default suite stays fully offline.

## Acceptance criteria

- **AC1** [L0] Given a Gemini pipeline with injected fake GitHub and portfolio ingestion results, when it runs with candidate URLs, then the `github_evidence` and `portfolio_evidence` stages complete and the downstream evidence checker prompt includes the concrete source details.
- **AC2** [L1] Given compliant fake LLM outputs that cite the injected GitHub/portfolio sources, when the pipeline returns a report, then `eval.Validate` reports zero policy violations.
- **AC3** [L2] Given GitHub or portfolio ingestion returns degraded/empty evidence, when the pipeline runs, then the corresponding stage records a `warning` or safe completed state, the final report remains valid, and missing public evidence is framed as interview validation rather than a gap.
- **AC4** [L0] Given the default test suite, no live GitHub, portfolio, Gemini, or cloud calls occur; all external ingestion and LLM calls are faked.
- **AC5** The `mock` pipeline remains unchanged: it emits the same ten stages, remains deterministic, and performs no network calls.
- **AC6** `cmd/server` passes `GITHUB_TOKEN` into the Gemini pipeline only as configuration; the token is never logged, rendered, serialized into prompts, or committed.

## Tasks

- [x] Add a small ingestion configuration/seam to `GeminiPipeline` for GitHub token and injectable GitHub/portfolio fetch functions.
- [x] Replace mocked `github_evidence` and `portfolio_evidence` stages with calls to the implemented ingest packages, preserving graceful degradation.
- [x] Include compact source/summary context in the evidence-checking prompt variables.
- [x] Wire `GITHUB_TOKEN` from `cmd/server` into Gemini mode.
- [x] Add offline tests proving source propagation, degraded ingestion fallback, no-network behavior, and unchanged mock behavior.
- [x] Document the integration boundary and env var behavior.

## Done when

`cd backend && go test ./internal/pipeline/...` and `pwsh orchestration/gate.ps1` pass fully offline. Manual live validation with `ANALYSIS_MODE=gemini` + `GITHUB_TOKEN` is recommended after merge, but it is not part of the default gate.
