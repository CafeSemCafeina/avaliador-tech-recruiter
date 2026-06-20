# Spec 005: Markdown export

- **Tier:** 1
- **Status:** Implemented (renderer + golden/policy tests done; HTTP wiring lands with spec 002)
- **Related to:** PRD §7, §8 (step 4); TECHNICAL_DESIGN §3, §5; ADR-0002; EVALUATION L0/L1
- **Estimate:** S
- **Owner engine:** small-model / gemini (mechanical rendering from a typed object)
- **Partition (paths this spec owns):** Go export package (e.g. `backend/internal/export/`)
- **Depends on:** spec 001, spec 004

## Objective

Render a completed `Report` to Markdown — the MVP's durable artifact, since the store is in-memory. The export is generated **from the same `Report` object** the UI uses, never re-derived, so the document and the screen cannot diverge. Served by `GET /api/analyses/{id}/export.md` (wired in spec 002).

## Non-objectives

- PDF or other formats (out of MVP).
- Re-running analysis or fetching anything; export is a pure function of the `Report`.

## Technical context

- Input: a `Report` (spec 001). Output: a deterministic Markdown string.
- Sections render in the TECHNICAL_DESIGN §5 order: executive summary, badges, four-quadrant matrix, confirmed strengths, strengths needing validation, confirmed gaps, weak signals needing validation, STAR questions, recruiter summary, hiring manager summary, methodology, limitations.
- The matrix renders as four labelled groups with each item's title, rationale, sources, and interview focus.
- The same policy constraints apply to the rendered text: no score, no forbidden vocabulary (the source `Report` already passed spec 004; export must not introduce violations).

## Acceptance criteria

- **AC1** [L0] Given a `Report`, when exported, then the Markdown contains all twelve sections in the specified order.
- **AC2** [L0] Given the same `Report`, the export is byte-identical across runs (pure/deterministic).
- **AC3** [L1] Given a compliant `Report`, the rendered Markdown contains no forbidden vocabulary and no numeric fit/score (validator run over the rendered text passes).
- **AC4** [L0] Every `QuadrantItem` in the report appears in the Markdown under its correct quadrant heading, with its sources listed.
- **AC5** The export function takes only a `Report` and performs no I/O.

## Tasks

- [ ] Implement `Report → string` Markdown renderer covering all sections in order.
- [ ] Render the four-quadrant matrix with per-item title/rationale/sources/interview focus.
- [ ] [P] Golden-file test: a fixture `Report` renders to a committed expected `.md` (AC1, AC2, AC4).
- [ ] [P] Run the spec 004 validator over the rendered text (AC3).

## Done when

`go test ./...` passes the golden-file and policy tests; `GET …/export.md` returns the rendered document for a completed analysis (per spec 002).
