# Technical Design - Avaliador Tech Recruiter

Status: Draft accepted for MVP implementation  
Date: 2026-06-20

## 1. Implementation Strategy

The MVP will be implemented backend-first.

Reasoning:

- the backend defines the contracts that the frontend consumes;
- the analysis pipeline is the core product behavior;
- a mock pipeline can stabilize API, SSE, report JSON, tests, and CI before real model calls are added;
- the frontend can then consume realistic contracts instead of local-only mock structures.

First implementation slice:

1. Go API with contracts.
2. In-memory analysis job runner.
3. SSE progress events.
4. Mock analysis pipeline.
5. Structured report JSON.
6. Markdown export.
7. Backend tests.
8. Frontend conversion and integration.

## 2. Runtime Modes

The backend supports analysis modes through environment configuration.

Initial mode:

```text
ANALYSIS_MODE=mock
```

Future real mode:

```text
ANALYSIS_MODE=gemini
```

The UI will not expose a public toggle. This avoids confusing recruiters and keeps the demo product-like. Local development can switch modes through environment variables.

## 3. Backend

### Stack

- Go.
- `chi` for routing.
- Manual input validation.
- In-memory analysis store.
- SSE for progress.
- JSON-first report contracts.

### Endpoints

```text
GET  /health
POST /api/documents/extract-text
POST /api/analyses
GET  /api/analyses/{id}
GET  /api/analyses/{id}/events
GET  /api/analyses/{id}/export.md
```

`POST /api/documents/extract-text` is a bounded synchronous preprocessing endpoint. It accepts `multipart/form-data` with a required `file` and optional `kind=resume|linkedin`, calls the Go-native PDF extractor, and returns:

```json
{
  "text": "extracted text",
  "pages": 2,
  "hasText": true,
  "warnings": []
}
```

The endpoint does not create an analysis. PDF bytes and parser internals are never stored, logged, sent to an LLM, or included in a report/export.

### Job runner

The first MVP uses an in-memory job runner:

- `POST /api/analyses` validates input and creates an `analysisId`;
- a goroutine runs the analysis pipeline;
- analysis state is stored in memory;
- event history is stored with the analysis;
- report is stored in memory after completion;
- state is lost when the process restarts.

This is acceptable because the MVP is single-candidate, demo-oriented, and includes Markdown export as the durable artifact.

## 4. SSE Progress

Progress is exposed via Server-Sent Events:

```text
GET /api/analyses/{id}/events
```

Each event includes:

- analysis id;
- stage id;
- stage name;
- status;
- message;
- timestamp;
- optional duration;
- optional error.

The backend also stores the complete event history. The final report includes a methodology block built from this timeline.

Example event:

```json
{
  "analysisId": "analysis_123",
  "stage": "github_evidence",
  "status": "running",
  "message": "Analyzing public repositories",
  "timestamp": "2026-06-20T12:00:00Z"
}
```

## 5. Report Contract

The backend returns structured JSON. Markdown is generated from the same report object.

The frontend should not parse Markdown to render the main UI.

Core report sections:

- executive summary;
- qualitative badges;
- four-quadrant evidence matrix;
- confirmed strengths;
- strengths needing validation;
- confirmed gaps;
- weak signals needing validation;
- STAR interview questions;
- recruiter summary;
- hiring manager summary;
- methodology;
- limitations.

No final numeric score or hiring verdict is allowed.

## 6. Evidence Matrix

The four quadrants are:

1. Strong with evidence.
2. Strong but needs validation.
3. Weak with evidence.
4. Weak but needs validation.

Each matrix item should include:

- title;
- quadrant;
- rationale;
- sources;
- interview focus;
- optional STAR question references.

Missing public evidence must not be treated as proof that the candidate lacks a skill. It becomes an interview validation item.

## 7. Agent Pipeline

The first implementation uses a mock/deterministic pipeline. The real implementation will use Gemini for all agents.

Pipeline stages:

1. `JobProfileAgent`
2. `ResumeEvidenceAgent`
3. `LinkedInEvidenceAgent`
4. `GitHubEvidenceAgent`
5. `PortfolioEvidenceAgent`
6. `EvidenceCheckerAgent`
7. `QuadrantClassifierAgent`
8. `STARQuestionAgent`
9. `TechnicalMaturityAnalystAgent`

### Gemini and ADK plan

Gemini is the first real LLM provider because it is the available provider.

Two model levels are planned:

- fast model for extraction and summarization;
- stronger model for evidence checking, quadrant classification, and final analyst reasoning.

Google ADK for Go will be spiked before committing to the final real-agent implementation. Adoption criteria are documented in [ADR 0011](adr/0011-use-gemini-and-spike-google-adk.md).

## 8. Uploads and Document Parsing

The MVP supports real uploads from the first product version.

Limits:

- 10 MB max per file;
- 20 pages max per PDF;
- 5-second extraction timeout;
- resume PDF/text;
- LinkedIn PDF/text export;
- fallback text paste for parsing failures.

Document parsing:

- use Go-native open-source PDF text extraction per [ADR 0017](adr/0017-go-native-pdf-extraction.md);
- OCR disabled by default;
- timeout required;
- clear error if parsing fails;
- manual text fallback remains available.

Upload flow:

1. The frontend sends one PDF to `POST /api/documents/extract-text`.
2. The backend enforces multipart, content-type, size, page, and timeout bounds before returning extracted text.
3. The frontend fills the existing resume or LinkedIn textarea without starting analysis automatically.
4. The recruiter reviews or edits the text.
5. The normal `POST /api/analyses` JSON request carries only `CandidateInput` text and URLs.

Empty or scanned PDFs return `200 OK` with `hasText=false` and a user-safe warning. Missing, malformed, unsupported, or oversized input returns a bounded `4xx` response with field-level errors.

## 9. LinkedIn Input

The product will not scrape LinkedIn or request cookies.

Supported inputs:

- LinkedIn PDF export;
- printed/saved profile PDF;
- pasted LinkedIn text.

The UI must include a short privacy note:

> Files are processed for this analysis only. Reports are stored in memory for the current session and may be lost on restart. Do not upload sensitive data you do not want processed in this demo.

## 10. GitHub Static Analyzer

The GitHub analyzer is medium-plus with code sampling.

It analyzes one candidate at a time.

Repository selection:

- public non-empty repositories;
- up to 5 relevant repositories;
- forks excluded by default but can be listed separately;
- prioritize repos matching the job stack;
- prioritize repos with README, commits, app structure, tests, CI, Docker, or portfolio/curriculum references.

Per selected repo, inspect:

- README;
- docs indicators;
- recent commits;
- languages;
- topics;
- file tree;
- `package.json`;
- `go.mod`;
- `requirements.txt`;
- `pyproject.toml`;
- `Dockerfile`;
- `.github/workflows/*`;
- selected source files.

Code sampling limits:

- up to 12 source files per repo;
- around 2,000 lines per repo;
- ignore generated, build, vendor, dependency, lock, and asset files.

The analyzer reads code statically but does not execute candidate code.

Signals:

- frontend/backend/full-stack;
- project depth;
- architecture hints;
- testing hints;
- CI/deploy hints;
- documentation maturity;
- recency;
- consistency with declared stack.

## 11. Portfolio Mini-Crawler

The portfolio analyzer uses a bounded mini-crawler.

Steps:

1. Fetch the root portfolio URL.
2. Extract internal links.
3. Select up to 5 relevant internal pages.
4. Fetch selected pages.
5. Extract text, project signals, stack signals, and external links.

Relevant route/link hints:

- `/projects`;
- `/portfolio`;
- `/work`;
- `/case-studies`;
- `/about`;
- `/blog`;
- `/posts`;
- link text such as "Project", "Work", "Case Study", "Apps".

Limits:

- no JavaScript execution;
- no deep crawling;
- timeout per page;
- no external fetches;
- GitHub links are recorded but handled by the GitHub analyzer.

## 12. Frontend

### Strategy

Frontend is a single-page React + TypeScript + Vite application with local state and `useReducer`.

No React Router in the first MVP.

### UI source

The first visual design comes from Claude Design, delivered as a self-contained design system (not raw per-screen HTML). It is versioned under:

```text
design/
```

Key contents:

```text
design/styles.css              global token entry (@imports tokens/*)
design/tokens/                 colors, typography, spacing, fonts, base
design/assets/                 brand logo SVGs
design/components/             core, forms, feedback, recruiting primitives (.jsx + .d.ts + .prompt.md)
design/guidelines/             foundation specimen cards
design/ui_kits/analyzer/       the canonical four-screen flow (JSX) + index.html
design/readme.md, SKILL.md     design-system rules and skill entry point
```

The canonical reference for layout, density, and copy is `design/ui_kits/analyzer/`, which composes the design-system primitives into the four screens:

```text
JobInputScreen.jsx
CandidateEvidenceScreen.jsx
AnalysisProgressScreen.jsx
ReportScreen.jsx
```

These screens are converted into typed React components against the design-system tokens. New work must design with the CSS custom properties in `design/tokens/`, never raw hex.

### Main UI states

1. Job input.
2. Candidate input.
3. Analysis progress.
4. Report.

The candidate-input state includes PDF upload controls beside the resume and LinkedIn textareas. Upload success fills the matching textarea; upload warnings/errors are shown inline, and the user remains in control of the text submitted for analysis.

## 13. Dataset Strategy

The repository includes a fictitious dataset for tests and demo safety.

The public app can accept real inputs through the UI, but the MVP does not persist reports permanently.

Recommended split:

- fictitious fixtures in repo;
- real personal/demo analyses outside Git or provided through UI;
- no committed personal candidate data.

## 14. Privacy and Data Handling

The MVP processes uploaded files for the current analysis only.

PDF bytes are held only for the synchronous extraction request and discarded after the response. They are not written to the in-memory analysis store or included in model prompts, reports, events, logs, or Markdown exports.

No login, no multi-user account, and no durable database storage are planned for the first version.

The product must display a short privacy warning before analysis starts.

## 15. Testing

Backend tests:

- input validation;
- PDF upload/extraction handler bounds and error mapping;
- analysis creation;
- lifecycle transitions;
- SSE event history;
- report JSON fixture;
- Markdown export;
- quadrant classification;
- GitHub analyzer fixtures;
- LLM mocked.

Frontend tests:

- stack tag interactions;
- max three primary stacks;
- report rendering;
- API client behavior;
- progress state rendering.

E2E:

- one happy path with mocked analysis output.

Live Gemini, GitHub, cloud, and document parser calls should not run in default unit tests.

## 16. CI

Minimal CI:

- Go fmt/vet/test/build;
- frontend lint/typecheck/test/build;
- Docker build;
- lightweight secret scanning;
- optional vulnerability checks if they do not block progress.

Deploy CI can be added after the local product is stable.

## 17. AWS Deployment

Frontend:

- AWS Amplify;
- env var `VITE_API_BASE_URL`;
- GitHub-connected deploy.

Backend:

- Docker image;
- Amazon ECR;
- AWS ECS Express Mode;
- CloudWatch logs;
- `/health` health check.

Fallback:

- Render backend if ECS Express Mode blocks progress;
- keep Amplify frontend.

## 18. Development Workflow

Preferred local workflow:

- WSL/Ubuntu;
- tmux session with backend, frontend, tests, infra, logs, git;
- SSH for GitHub;
- Docker for backend packaging.

Planned script:

```text
scripts/dev-tmux.sh
```

## 19. Open Implementation Notes

These are implementation details to settle during build:

- exact Gemini model names;
- ADK accepted or rejected after spike;
- source file selection heuristics for GitHub code sampling;
- AWS ECS Express Mode availability in the account.
