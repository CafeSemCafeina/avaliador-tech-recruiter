# Avaliador Tech Recruiter

AI-native technical maturity scanner for recruiters.

Repository: https://github.com/CafeSemCafeina/avaliador-tech-recruiter

This project is a small recruiting-assessment MVP designed to help recruiters evaluate a candidate's technical maturity from job requirements, resume evidence, public GitHub activity, LinkedIn export text/PDF, and portfolio links.

The product is intentionally **evidence-first** and **human-reviewed**. It does not produce a final fit score or hiring verdict. Instead, it organizes technical evidence into a recruiter-friendly matrix and generates structured STAR interview questions.

## Why This Exists

Modern technical hiring often has two weak spots:

- resumes contain claims that are hard to validate quickly;
- public evidence such as GitHub, portfolio pages, courses, and LinkedIn signals is fragmented.

This MVP turns those inputs into an analyst-style report:

- what is strong and evidenced;
- what looks strong but needs validation;
- what is weak with evidence;
- what looks weak but needs validation;
- which STAR questions should be asked in the technical screening.

## Product Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Execution Plan](docs/EXECUTION_PLAN.md)
- [Evaluation Strategy](docs/EVALUATION.md)
- [Architecture Decision Records](docs/adr/README.md)

## Core Concept

The report uses a four-quadrant evidence matrix:

| Quadrant | Meaning |
| --- | --- |
| Strong with evidence | The candidate claims it and the available evidence supports it. |
| Strong but needs validation | The claim is plausible, but evidence is incomplete or indirect. |
| Weak with evidence | The available evidence indicates a real gap for this role. |
| Weak but needs validation | There are weak signals, but not enough evidence to conclude. |

The tool avoids cold percentages or ranking. Missing public evidence is treated as something to validate, not as proof that the candidate lacks a skill.

## Planned MVP Scope

### 48-hour version

- React + TypeScript + Vite frontend.
- Go backend API.
- Controlled agent pipeline using a Go-native agent framework.
- Resume PDF/text parsing through an open-source document parser.
- GitHub static analysis for public non-empty repositories.
- LinkedIn PDF/text upload or manual paste.
- Portfolio page text extraction.
- Evidence matrix report.
- STAR interview questions.
- Markdown export.
- Minimal tests and CI.
- Frontend deployed on AWS Amplify.
- Backend container deployed on AWS ECS Express Mode.

### 1-week version

- Better PDF parsing and error handling.
- Persisted reports.
- Analyst chat over the generated report.
- Stronger GitHub static analyzer.
- AWS S3 for uploads/exports.
- More complete CI/CD to ECR/ECS.
- Repo-specific AI coding skills and internal agent rubrics.
- Optional MCP interface or Claude Code skill expansion.

## Proposed Architecture

```text
AWS Amplify
  React + TypeScript + Vite UI
        |
        v
AWS ECS Express Mode
  Go HTTP API
  Agent pipeline
  Doc parsing worker
  GitHub static analyzer
        |
        v
AI provider
  Structured evidence analysis
  STAR question generation
```

## Agent Pipeline

The initial design uses a controlled workflow instead of free-form autonomous agents:

1. `JobProfileAgent` builds the technical maturity profile expected for the role.
2. `ResumeEvidenceAgent` extracts claims from the resume.
3. `LinkedInEvidenceAgent` extracts public professional signals from exported LinkedIn text/PDF.
4. `GitHubEvidenceAgent` analyzes public repositories statically.
5. `PortfolioEvidenceAgent` extracts project and stack signals from portfolio pages.
6. `EvidenceCheckerAgent` compares claims against evidence.
7. `QuadrantClassifierAgent` maps findings into the four evidence quadrants.
8. `STARQuestionAgent` creates interview questions from the evidence matrix.
9. `TechnicalMaturityAnalystAgent` self-reviews and writes the final report.

## Technical Principles

- Do not make hiring decisions.
- Do not produce a final numeric score.
- Separate evidence from inference.
- Treat missing evidence as an interview question, not a verdict.
- Prefer deterministic code for normalization and parsing boundaries.
- Mock LLM calls in tests.
- Keep the first deploy stateless.

## Stack

- Backend: Go.
- Frontend: React, TypeScript, Vite.
- Agent orchestration: Go-native agent framework.
- PDF/document parsing: open-source parser integration.
- Static repo analysis: GitHub API + file tree inspection.
- Cloud: AWS Amplify, ECR, ECS Express Mode, CloudWatch.
- CI: GitHub Actions.

## Development Workflow

The project is intended to be developed from a Linux-like environment, preferably WSL/Ubuntu:

- `tmux` for backend, frontend, tests, logs, and infra commands.
- SSH for GitHub access.
- Docker for backend packaging.
- GitHub Actions for CI.

## Running the Backend

The Go backend runs by default in `mock` mode:
```bash
cd backend
go run ./cmd/server
```

### Gemini Mode (Spec 006)

Real Gemini agents run behind the same `LLMClient` seam with two selectable backends (ADR-0011). Copy `backend/.env.example` to `backend/.env` and pick one.

**Vertex AI (default — uses the GCP Free Trial credit).** Authenticate once with Application Default Credentials, then configure the project:
```bash
gcloud auth application-default login
```
```env
ANALYSIS_MODE=gemini
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=global
GEMINI_MODEL_FAST=gemini-3.5-flash
GEMINI_MODEL_STRONG=gemini-3.1-pro-preview
PORT=8080
```

**Gemini Developer API (API key).** Used only when `GOOGLE_GENAI_USE_VERTEXAI` is unset/false:
```env
ANALYSIS_MODE=gemini
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_FAST=gemini-3.5-flash
GEMINI_MODEL_STRONG=gemini-3.1-pro-preview
PORT=8080
```

Then run (the server loads `.env` automatically):
```bash
cd backend
go run ./cmd/server
```
If a provider call fails, each agent degrades to a deterministic fallback, so the run always completes with a valid, policy-compliant report.

## Current Status

The repository has a working mock-mode floor, a Gemini-backed text-agent pipeline behind `LLMClient`, and Tier 3 ingestion packages for GitHub-lite evidence, Go-native PDF text extraction, and bounded portfolio crawling.

Current integration boundary: GitHub and portfolio ingestion packages are implemented but not yet wired into the `gemini` pipeline stages, and PDF extraction is implemented as a backend package but not yet exposed through an upload/API flow. The next implementation step is an orchestrator-owned wiring spec that feeds these real ingestion signals into the report while preserving the mock-mode fallback.
