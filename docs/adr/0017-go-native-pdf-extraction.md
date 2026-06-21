# ADR 0017 - Go-native PDF text extraction (not Docling/Python)

Status: Accepted
Date: 2026-06-21

## Context

Tier 3b (spec 008) adds PDF text extraction so candidates can upload a resume /
exported-LinkedIn PDF instead of pasting text. The PRD/Technical Design name
**Docling** as the preferred parser (TD §16), but Docling is a Python library and
this backend is Go. TD §19 explicitly lists "exact Docling invocation strategy" as
an open question. Adding Python means a sidecar process or a second runtime in the
container, which complicates deploy (Tier 4) for a feature whose fallback
(paste-text) already satisfies the floor.

## Decision

Use **pure-Go PDF text extraction** for Tier 3b. No Python, no Docling, no
external process. Paste-text remains the always-available fallback, so PDF is pure
upside and never on the critical path.

- Library: a pure-Go extractor (default `github.com/ledongthuc/pdf`); the spec-008
  implementer may swap for another pure-Go lib if the committed fixtures extract
  better, as long as it stays pure-Go and adds no runtime dependency.
- Scope: text extraction only. OCR off (scanned PDFs degrade to "no text" →
  paste fallback). No layout/table reconstruction.
- Bounds: size limit, page cap, per-call timeout (PRD §16).

Full Docling-grade structured parsing stays at the **cut line** — revisit only if
plain text proves insufficient and the deploy budget allows a Python sidecar.

## Alternatives considered

- **Docling via Python sidecar/subprocess** — closest to the original plan and
  best structure quality, but adds a Python runtime to the Go container, a
  subprocess boundary, and packaging risk, for marginal gain over plain text at MVP.
- **Cloud document-AI API** — rejected: external dependency + cost + sends user
  content off-box (privacy), and live calls must stay out of CI.
- **Defer PDF entirely** — viable (paste-text covers the floor) but uploading a
  PDF is a real usability win and pure-Go makes it cheap.

## Consequences

Positive: backend stays single-runtime Go; deploy unaffected; offline-testable
with fixture PDFs; fallback keeps the floor safe.

Negative: lower extraction fidelity than Docling on complex layouts; scanned PDFs
unsupported (degrade to paste). If fidelity becomes a real problem, the Docling
sidecar decision is revisited here.

## Validation

`spec 008` ships `internal/ingest/pdf` with offline fixture tests; `go.mod` gains
only a pure-Go PDF dependency; no Python in the toolchain or CI.
