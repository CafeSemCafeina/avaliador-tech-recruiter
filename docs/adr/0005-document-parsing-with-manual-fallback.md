# ADR 0005 - Use document parsing with manual fallback

Status: Accepted  
Date: 2026-06-20

## Context

Resumes and LinkedIn exports often arrive as PDFs. PDF extraction is messy: layouts, columns, icons, links, and generated PDFs can break naive text extraction.

The project should show pragmatic use of existing open-source tools rather than rebuilding document parsing from scratch.

## Decision

Use an open-source document parser for PDF extraction, with manual text paste as a required fallback.

Preferred approach:

- use Docling or a similar open-source parser;
- export extracted content to Markdown or structured text;
- disable OCR by default for the MVP;
- set file size limits and parsing timeouts;
- allow the user to paste text manually if parsing fails.

## Alternatives considered

### Build PDF parsing manually in Go

Rejected. It would consume time and produce weaker extraction.

### Use OCR-heavy document intelligence from day one

Rejected. It increases runtime, image size, cost, and deployment complexity.

### Require text paste only

Rejected as the only path. It is reliable but weakens the product experience.

## Consequences

Positive:

- better extraction quality;
- demonstrates reuse of open-source tooling;
- keeps the backend focused on analysis.

Negative:

- Python/document parsing may make the container heavier;
- parsing can still fail on some PDFs;
- deployment memory/timeout needs attention.

## Validation

The parser must be tested with at least one resume fixture and one fallback text path. If parsing fails, the UI must explain the fallback instead of blocking the user.

