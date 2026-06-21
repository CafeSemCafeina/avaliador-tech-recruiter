# Spec 008: PDF text extraction (resume / LinkedIn)

- **Tier:** 3 (3b)
- **Status:** Implemented
- **Related to:** PRD §16; TECHNICAL_DESIGN §9, §16; ADR-0017; ADR-0002; EXECUTION_PLAN Tier 3b; EVALUATION L0
- **Estimate:** M
- **Owner engine:** codex
- **Partition (paths this spec owns):** `backend/internal/ingest/pdf/` and `specs/008-pdf-text-extraction.md`. Does **not** edit the API or pipeline wiring — the orchestrator adds the upload/parse entry point at integration.
- **Depends on:** spec 001 (contracts)

## Objective

Extract plain text from an uploaded resume or exported-LinkedIn **PDF**, so the candidate doesn't have to paste text. **Go-native extraction** (no Python/Docling dependency) per [ADR-0017](../docs/adr/0017-go-native-pdf-extraction.md); the existing paste-text path remains the always-available fallback (the Tier 1 floor never depended on PDF).

## Non-objectives

- OCR of scanned/image PDFs (out of scope; degrade to "no text extracted").
- Layout/table reconstruction or Docling-grade structure (cut line).
- The HTTP upload endpoint and pipeline wiring (orchestrator owns those).

## Technical context

- Pure-Go PDF text extraction (ADR-0017 picks the library). Input: PDF bytes; output: extracted UTF-8 text + a small status (page count, whether text was found).
- Bounds (PRD §16): 10 MB, 20 pages, and a 5-second per-call timeout; reject oversized input with a clear error. OCR off.
- A scanned/empty PDF yields empty text + a "no extractable text" status, so the caller falls back to paste-text — never an error that breaks the run.
- This package only extracts text; it produces no `contract.Source` directly (the downstream resume/LinkedIn agents already source pasted text the same way).
- **Offline tests only:** committed fixture PDFs (fictitious content); no network.

## Acceptance criteria

- **AC1** [L2] Given a committed text-based fixture PDF, when `Extract` runs, then it returns the expected text (key phrases present) and `hasText=true`.
- **AC2** Given a PDF over 10 MB or 20 pages, when `Extract` runs with default options, then it returns a clear bounds error and extracts nothing.
- **AC3** Given a scanned/image-only or empty PDF, when `Extract` runs, then it returns empty text with `hasText=false` (no panic), so the caller uses the paste fallback.
- **AC4** [L0] No network calls and no external process/binary spawned (pure Go); verified offline.
- **AC5** `Extract` respects `ctx` cancellation and the configured timeout.

## Tasks

- [ ] [ADR-0017] pin the pure-Go PDF library (default `github.com/ledongthuc/pdf` unless fixtures justify another pure-Go choice).
- [ ] `internal/ingest/pdf`: `Extract(ctx, data, opts) (Result, error)` with `Result{Text, Pages, HasText}`.
- [ ] Enforce size/page/timeout bounds; OCR off; safe handling of malformed PDFs.
- [ ] [P] Tests with committed fictitious fixture PDFs covering AC1–AC3, AC5.
- [ ] [P] Guard test asserting no network/process spawn (AC4).

## Done when

`go test ./internal/ingest/pdf/...` passes AC1–AC5 fully offline. Wiring an upload path + feeding extracted text into the pipeline is a separate orchestrator step; paste-text remains the fallback.
