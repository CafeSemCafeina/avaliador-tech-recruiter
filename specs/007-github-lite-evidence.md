# Spec 007: GitHub-lite evidence ingestion

- **Tier:** 3 (3a)
- **Status:** Implemented
- **Related to:** PRD §11.4, §15; TECHNICAL_DESIGN §10; ADR-0002; ADR-0011; EXECUTION_PLAN Tier 3a; EVALUATION L0/L1
- **Estimate:** M
- **Owner engine:** codex
- **Partition (paths this spec owns):** `backend/internal/ingest/github/` (new package) and `backend/.env.example` for `GITHUB_TOKEN` documentation. Does **not** edit `internal/pipeline/gemini.go` — the orchestrator wires this source into the pipeline at integration.
- **Depends on:** spec 001 (contracts)

## Objective

Provide real, read-only GitHub evidence for the `GitHubEvidenceAgent`: from a public profile or repo URL, fetch lightweight signals (metadata + README + manifest/CI/Docker presence) and return them as typed `contract.Source` entries plus a small structured summary the pipeline can feed to the analyst. **No code sampling** (that is the cut line). This is added behind a documented fallback (ADR-0011 spirit): any failure degrades to "not publicly evidenced", never breaks the run.

## Non-objectives

- Code sampling / file content analysis (cut line, TECHNICAL_DESIGN §10 ambitious half).
- Editing the gemini pipeline wiring (orchestrator owns that).
- Authenticated org/private repos; only public data.

## Technical context

- Input: a GitHub URL (profile or repo) from `CandidateInput.GithubURL`.
- Use the GitHub REST API. Auth via `GITHUB_TOKEN` env (unauthenticated is 60 req/h — PRD §22 risk); when absent, still work but cap requests and degrade gracefully.
- Signals to extract (TECHNICAL_DESIGN §10, no code sampling): languages; presence of README; manifest detection (`go.mod`, `package.json`, `requirements.txt`, `pyproject.toml`); `Dockerfile`; `.github/workflows/*` (CI); test/CI/deploy indicators; repo count, recent activity, stars (qualitative only — never a numeric "score" in output).
- Cap repos analyzed (e.g. ≤ 5, prioritizing repos with README/commits/structure per TD §10).
- Output: a function like `Fetch(ctx, url, token) (Evidence, error)` where `Evidence` carries `[]contract.Source` (kind `github`, detail = concrete finding) plus a structured summary (languages, has-tests, has-ci, has-docker, etc.). On any error/timeout, return an empty/degraded `Evidence` (no sources) so the caller treats it as "not publicly evidenced", never a gap.
- **Offline tests only:** mock the GitHub API with `httptest` and committed JSON fixtures; no live `api.github.com` calls in `go test` (ADR-0009).

## Acceptance criteria

- **AC1** [L2] Given a mocked GitHub API returning a profile with repos (one with `go.mod` + `.github/workflows` + README), when `Fetch` runs, then `Evidence` reports the languages, `hasCI=true`, `hasTests`/`hasDocker` per fixture, and ≥1 `contract.Source{kind:"github"}` with a concrete detail.
- **AC2** [L0] Every returned `Source` has `kind == "github"` and a non-empty `detail`; no numeric score/rating/fit/percentage appears in any text field (ADR-0002).
- **AC3** Given the API returns 404 / rate-limit / network error, when `Fetch` runs, then it returns a degraded `Evidence` with no sources and a nil-or-sentinel error the caller can treat as "not publicly evidenced" — it never panics or blocks.
- **AC4** [L0] No live network calls in the default test suite (verified with a forbidden-transport guard, like the mock pipeline).
- **AC5** Requests are capped (≤ configured max repos) and respect `ctx` cancellation and a per-call timeout.

## Tasks

- [ ] `internal/ingest/github`: `Fetch(ctx, url, token)` + `Evidence` type (sources + structured summary).
- [ ] URL parsing (profile vs repo), repo selection/cap, manifest/CI/Docker/README detection via the REST API.
- [ ] Graceful degradation on 404/rate-limit/timeout; honor `GITHUB_TOKEN`.
- [ ] [P] Tests with `httptest` + committed fixtures covering AC1–AC3, AC5.
- [ ] [P] No-network guard test (AC4).
- [ ] Document `GITHUB_TOKEN` in `.env.example` (do not commit a token).

## Done when

`go test ./internal/ingest/github/...` passes AC1–AC5 fully offline. Integration into the gemini pipeline's `github_evidence` stage is a separate orchestrator step.
