---
name: go-backend-conventions
description: Conventions for the avaliador-tech-recruiter Go backend (Go + chi, in-memory store, SSE progress, JSON-first contracts, async analysis runner, LLMClient/Pipeline seams). Use when writing, reviewing, or scaffolding any Go code in this repo — HTTP handlers, the in-memory store, the analysis state machine, SSE event streaming, the agent pipeline, validation, or Go tests. Triggers on Go files under backend/, chi routing, SSE, ANALYSIS_MODE, the nine-agent pipeline, or "Go conventions / backend conventions" requests.
---

# Go backend conventions (avaliador-tech-recruiter)

Authoritative sources: [docs/TECHNICAL_DESIGN.md](../../../docs/TECHNICAL_DESIGN.md) §3–§7, [docs/PRD.md](../../../docs/PRD.md) §11/§13/§14, and the Tier 1 specs under `specs/`. The docs are the spec; code that conflicts with them is a bug.

## Non-negotiables (these fail review)
- **Never implement a unit without a `Ready` spec** (specs/). Build to the spec's acceptance criteria; the "Done when" eval command is the bar.
- The contract types (`JobInput`, `CandidateInput`, `Source`, `QuadrantItem`, `Report`) are the **frozen seam** (spec 001). Everything depends on them; do not redefine or fork them.
- **No field named `score`/`rating`/`fit`/`percentage` and no numeric fit value anywhere** (ADR-0002). The policy validator (spec 004) runs in the request path; a non-compliant report is never served.
- **Mock mode is the protected floor.** Default `ANALYSIS_MODE=mock` makes zero network/model calls. Real Gemini/GitHub/PDF goes behind the `LLMClient` interface (Tier 2+), each with a documented fallback. Live calls never run in the default test suite.

## Stack & layout
- Go + `chi` router; in-memory store (state lost on restart; Markdown export is the durable artifact). Package layout the specs assume: `backend/internal/contract`, `.../api`, `.../store`, `.../pipeline`, `.../eval`, `.../export`. Reconcile these to the real module path once Tier 0 scaffolds it, then keep specs' partition paths in sync.
- **JSON-first, camelCase on the wire.** Struct JSON tags are camelCase so Go and TS share one shape (spec 001 round-trips Go marshal ↔ TS parse).

## HTTP surface (TECHNICAL_DESIGN §3)
- `GET /health` → 200 liveness.
- `POST /api/analyses` → validate inputs; `201 {analysisId}` + start async runner; `400` with field-level errors on invalid input.
- `GET /api/analyses/{id}` → status while running, status + `Report` once complete; `404` unknown.
- `GET /api/analyses/{id}/events` → SSE: replay stored stage history, then stream live, close on terminal state. Event fields: `analysisId`, `stage`, stage name, `status`, `message`, `timestamp`, optional `duration`, optional `error`.
- `GET /api/analyses/{id}/export.md` → `text/markdown` when complete, `409` if not complete, `404` unknown.

## State machine & runner
- `queued → running → completed | failed`. The runner is a goroutine invoking the `Pipeline` interface; it records every stage event and the final report. Store access is concurrency-safe (guard the map with a mutex; copy out, don't leak internal pointers).
- A policy violation (spec 004) fails the analysis — do not serve a non-compliant report.

## Validation (spec 002)
- `seniority ∈ {intern,junior,mid,senior,staff}`; `primaryStacks ⊆ stackTags` and `len ≤ 3`; required-vs-optional input rules per PRD §8 step 2 / TD §9. Return field-level errors, not a generic 400.

## Seams (so Tier 2 is a drop-in)
- `Pipeline.Run(ctx, JobInput, CandidateInput, emit func(StageEvent)) (Report, error)` — the runner depends only on this interface.
- `LLMClient` — all model access flows through it; the mock needs no real client; the `gemini` impl plugs in behind the same interface (ADR-0011). Inject the client/transport so tests can forbid network use.

## Style & tests
- Idiomatic Go: errors wrapped with `%w` and context; no panics in request paths; `context.Context` first arg on anything cancellable. `gofmt`/`go vet` clean.
- **Table-driven tests**, `t.Run` subtests, `t.Parallel()` where safe. Mock the pipeline/LLM in handler tests; assert AC-by-AC from the spec. Determinism: mock pipeline output is byte-stable for a given input (golden/L2 fixtures depend on it).
- Fixtures are **fictitious** (no real candidate data, ever). Run `go fmt ./... && go vet ./... && go test ./...` before committing; commit atomically (one unit per commit); do not push to `main` without confirmation.
