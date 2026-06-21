# Spec 011: PDF upload API and UI fill-in

- **Tier:** 3 integration
- **Status:** Implemented
- **Related to:** PRD §8 Step 2, §11.2, §11.3, §13, §14, §16; TECHNICAL_DESIGN §3, §8, §9, §12, §14, §15; ADR-0002; ADR-0017; EXECUTION_PLAN Tier 3b; EVALUATION L0/L2
- **Estimate:** M
- **Owner engine:** codex
- **Partition (paths this spec owns):** `backend/internal/api/server.go`, `backend/internal/api/server_test.go`, `frontend/src/api.ts`, `frontend/src/api.test.ts`, `frontend/src/screens.tsx`, `frontend/src/screens.test.tsx`, `frontend/src/state.ts`, `frontend/src/app.css`, `docs/PRD.md`, `docs/TECHNICAL_DESIGN.md`, `specs/011-pdf-upload-api.md`, and `specs/README.md`. It consumes but does not redefine `backend/internal/ingest/pdf/`.
- **Depends on:** spec 001, spec 002, spec 008

## Objective

Expose the implemented Go-native PDF text extractor through the app so recruiters can upload a resume or exported LinkedIn PDF and have its extracted text fill the existing evidence text fields. The analysis request still sends plain `CandidateInput` JSON; uploaded PDF bytes are never sent to the pipeline, LLM, store, export, or report.

## Non-objectives

- OCR for scanned/image-only PDFs.
- Persisting uploaded files or extracted documents.
- Changing the frozen `CandidateInput` or `Report` contracts.
- Adding PDF bytes to the async analysis lifecycle.
- Parsing DOCX, images, or arbitrary remote URLs.
- Inferring candidate strengths directly from the upload endpoint; it only extracts text.

## Technical context

- Add the canonical backend endpoint `POST /api/documents/extract-text`, which accepts `multipart/form-data` with:
  - `file`: required PDF file.
  - `kind`: optional `resume` or `linkedin`, used only for UI/status copy and validation messages.
- The endpoint calls `internal/ingest/pdf.Extract(ctx, data, opts)` with the product bounds: 10 MB, 20 pages, and a 5-second extraction timeout. It returns JSON:

```json
{
  "text": "extracted text",
  "pages": 2,
  "hasText": true,
  "warnings": []
}
```

- Empty/scanned PDFs return `200 OK` with `hasText=false`, empty `text`, and a warning that paste-text remains available.
- Oversized files return `413 Payload Too Large`; malformed/non-PDF files return `400 Bad Request` with field errors. The error response must not include raw PDF bytes or parser internals.
- Frontend upload controls live beside the existing "Resume text" and "LinkedIn text" textareas. On success with `hasText=true`, the extracted text fills or appends to the matching textarea; the user can review/edit before running analysis.
- The existing paste path remains the fallback and still works without upload.

## Acceptance criteria

- **AC1** [L0] Given a committed text-based fixture PDF, when the upload endpoint receives it as `multipart/form-data`, then it returns `200 OK` with expected text, page count, and `hasText=true`.
- **AC2** [L2] Given a scanned/empty or no-text fixture, when uploaded, then the endpoint returns `200 OK`, `hasText=false`, and a user-safe warning; creating an analysis still requires another candidate source or pasted text.
- **AC3** Given an oversized file, unsupported content type, malformed multipart body, or missing `file`, the endpoint returns a bounded `4xx` error with field-level JSON and no panic.
- **AC4** The frontend can upload a resume PDF and fill the resume text field without starting analysis automatically.
- **AC5** The frontend can upload a LinkedIn PDF and fill the LinkedIn text field without starting analysis automatically.
- **AC6** [L1] No score/ranking/verdict wording is introduced in endpoint responses, UI copy, tests, or docs.
- **AC7** [L0] Default tests stay fully offline: no network calls, no external OCR/process dependency, no live LLM/cloud calls.

## Tasks

- [ ] Add `POST /api/documents/extract-text` to the backend router.
- [ ] Implement multipart parsing, file-size guard, PDF content validation, and safe JSON error responses.
- [ ] Call `ingest/pdf.Extract` and map its result to a small API response.
- [ ] Add backend API tests for text PDF, no-text PDF, malformed request, missing file, and oversized file.
- [ ] Add a frontend API helper for PDF extraction.
- [ ] Add resume and LinkedIn PDF upload controls that fill existing textareas and surface warnings/errors.
- [ ] Add focused frontend tests for fill-in behavior and conservative copy.

## Done when

`cd backend && go test ./internal/api/...`, `cd frontend && npm test`, and `pwsh orchestration/gate.ps1` pass fully offline. Manual browser validation with a local PDF fixture is recommended before merge.
