# Spec 002: Analysis lifecycle API

- **Tier:** 1
- **Status:** Draft
- **Related to:** PRD §13; TECHNICAL_DESIGN §3, §4; ADR-0013; EVALUATION L0
- **Estimate:** M
- **Owner engine:** codex (bounded, correctness-critical: state machine + concurrency)
- **Partition (paths this spec owns):** Go HTTP layer + in-memory store (e.g. `backend/internal/api/`, `backend/internal/store/`)
- **Depends on:** spec 001

## Objective

Define the HTTP surface and lifecycle that drives an analysis: create it, query its status/report, stream stage progress, and export Markdown. The runner is asynchronous (a goroutine) with an in-memory store; state is lost on restart, with the Markdown export as the durable artifact.

## Non-objectives

- The pipeline's stage logic (spec 003) and report content (spec 004) — this spec calls into them via an interface.
- Authentication, persistence beyond memory, multi-user (out of MVP per PRD §7).

## Technical context

- Endpoints (TECHNICAL_DESIGN §3):
  - `GET /health` → `200` liveness.
  - `POST /api/analyses` → validate `JobInput`+`CandidateInput`; on success `201` with `{ analysisId }` and start the runner; on invalid input `400` with field errors.
  - `GET /api/analyses/{id}` → status while running; status + `Report` once complete; `404` for unknown id.
  - `GET /api/analyses/{id}/events` → SSE stream of stage events (TECHNICAL_DESIGN §4 fields: `analysisId`, `stage`, stage name, `status`, `message`, `timestamp`, optional `duration`, optional `error`). Replays stored history then streams live; closes on terminal state.
  - `GET /api/analyses/{id}/export.md` → `text/markdown` once complete; `409` if not yet complete; `404` for unknown id.
- Analysis state machine: `queued → running → completed | failed`. Event history is stored with the analysis.
- Validation: `seniority` in enum; `primaryStacks ⊆ stackTags` and `len ≤ 3`; at least the resume text or a candidate source present (exact required-vs-optional rules from PRD §8 step 2 / TECHNICAL_DESIGN §9).

## Acceptance criteria

- **AC1** [L0] Given a valid payload, when `POST /api/analyses`, then `201` with an `analysisId` and a subsequent `GET /api/analyses/{id}` reports `running` then `completed`.
- **AC2** [L0] Given `primaryStacks` with 4 entries (or an entry not in `stackTags`), when `POST`, then `400` with a field error and no analysis is created.
- **AC3** [L0] Given an invalid `seniority`, when `POST`, then `400`.
- **AC4** [L0] Given a completed analysis, when `GET /api/analyses/{id}`, then the body includes a `Report` valid against spec 001 (L0 contract checks pass on it).
- **AC5** [L0] Given a running analysis, `GET …/export.md` returns `409`; once completed it returns `text/markdown`.
- **AC6** [L0] Given `GET …/events`, the stream replays prior stage events then emits live ones and terminates after the terminal stage.
- **AC7** [L0] Unknown `{id}` returns `404` on status, events, and export.

## Tasks

- [ ] In-memory store: create/get analysis, append/read event history, store final report (concurrency-safe).
- [ ] `POST /api/analyses` handler + input validation with field-level errors.
- [ ] Async runner goroutine invoking the pipeline interface (spec 003), recording events and the final report.
- [ ] `GET /api/analyses/{id}` (status + report-when-complete) and `404` handling.
- [ ] [P] SSE `events` endpoint with history replay + live stream + close on terminal.
- [ ] [P] `export.md` endpoint with `409`/`404` semantics (delegates rendering to spec 005).
- [ ] [P] `GET /health`.
- [ ] Handler tests covering AC1–AC7 with the pipeline mocked.

## Done when

`go test ./...` passes the handler/store tests for AC1–AC7, with the pipeline and report mocked; no live model/network calls in the suite.
