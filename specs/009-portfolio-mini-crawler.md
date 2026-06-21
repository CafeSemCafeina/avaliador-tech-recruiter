# Spec 009: Portfolio mini-crawler

- **Tier:** 3 (3c)
- **Status:** Implemented
- **Related to:** PRD §11.5; TECHNICAL_DESIGN §11; ADR-0002; EXECUTION_PLAN Tier 3c; EVALUATION L0/L1
- **Estimate:** S
- **Owner engine:** codex
- **Partition (paths this spec owns):** `backend/internal/ingest/portfolio/` and `specs/009-portfolio-mini-crawler.md`. Does **not** edit the pipeline wiring — the orchestrator wires the `portfolio_evidence` stage at integration.
- **Depends on:** spec 001 (contracts)

## Objective

Provide bounded portfolio evidence for the `PortfolioEvidenceAgent`: from a portfolio URL, fetch the root plus a few well-known paths, extract visible text and links, and return typed `contract.Source` entries plus a small summary. Lowest-priority Tier 3 item and first to be cut under pressure (EXECUTION_PLAN); keep it strictly bounded.

## Non-objectives

- Deep crawling, JS rendering, or following arbitrary links (TECHNICAL_DESIGN §11: no deep crawl, no JS).
- Following GitHub links (recorded only; handled by spec 007).
- Editing pipeline wiring (orchestrator owns it).

## Technical context

- Input: a portfolio URL from `CandidateInput.PortfolioURL`.
- Bounded mini-crawler (TECHNICAL_DESIGN §11): fetch the root, then try a small fixed set of known paths (`/about`, `/projects`, `/portfolio`, `/cv`, `/resume`, `/sobre`, `/projetos`, `/curriculo`, `/currículo`); **no JS, no deep crawl, hard cap on pages/bytes**, per-page timeout, total timeout.
- Only public Internet targets are fetched. Loopback, private, link-local, unspecified, and localhost targets are rejected before the HTTP transport; redirects are checked against the same rule. Tests may opt into private hosts only for local `httptest` fixtures.
- Extract visible text (strip tags/scripts) and links; record GitHub links as a note (do not fetch them). Produce `[]contract.Source{kind:"portfolio"}` with concrete details (e.g. "projects page lists 3 case studies") + a small summary.
- Conservative output only — no scores; missing/empty portfolio degrades to "not publicly evidenced", never a gap or an error that breaks the run.
- **Offline tests only:** mock the site with `httptest`; no live HTTP in `go test`.

## Acceptance criteria

- **AC1** [L2] Given a mocked site (root + `/projects`) served by `httptest`, when `Fetch` runs, then it returns ≥1 `contract.Source{kind:"portfolio"}` with a concrete detail and records any GitHub link found (without fetching it).
- **AC2** [L0] Every returned `Source` has `kind == "portfolio"` and non-empty `detail`; no numeric score/rating/fit/percentage in any text field (ADR-0002).
- **AC3** Given an unreachable URL, a private/link-local target, a redirect to a private target, a redirect loop, or content over the cap, when `Fetch` runs, then it stops before unsafe access or at the configured bound and returns a degraded `Evidence` (no sources), never panics or hangs.
- **AC4** [L0] No live network calls in the default test suite (forbidden-transport guard).
- **AC5** Page count, total bytes, and timeouts are capped and `ctx`-cancellable; no path outside the fixed allow-list and no non-public network target is fetched.

## Tasks

- [ ] `internal/ingest/portfolio`: `Fetch(ctx, url, opts) (Evidence, error)` with bounded crawl over the fixed path allow-list.
- [ ] HTML → visible text + link extraction (no JS); record GitHub links as notes.
- [ ] Enforce page/byte/timeout caps and degradation on error.
- [ ] [P] Tests with `httptest` covering AC1–AC3, AC5.
- [ ] [P] No-network guard test (AC4).

## Done when

`go test ./internal/ingest/portfolio/...` passes AC1–AC5 fully offline. Wiring into the `portfolio_evidence` stage is a separate orchestrator step.
