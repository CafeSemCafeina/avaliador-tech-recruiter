# Execution Plan - Avaliador Tech Recruiter

Status: Draft for MVP build  
Date: 2026-06-20

This plan refines the day-by-day roadmap in [PRD §26](PRD.md) into **risk-ordered tiers**. The day roadmap answers "what happens each day"; this plan answers "what must never break, and what gets cut first if the week goes sideways."

## 1. Strategy

Three rules drive every sequencing decision:

1. **The demo always works.** A mock-mode, end-to-end, deployable product is the *floor* (Tier 1). It is built before any real LLM, GitHub, or PDF dependency. If everything risky fails, this still demonstrates the full flow.
2. **Build in vertical slices.** Each tier produces a runnable product, not a layer. We never have "backend done, frontend not started." The contracts ([PRD §14](PRD.md)) are the seam, frozen early.
3. **Real fidelity is added in risk order, behind fallbacks.** The riskiest external dependencies (GitHub API ingestion, PDF parsing, ECS, ADK) are added last and each has a documented fallback already accepted in the ADRs.

The result: value is monotonic. At the end of every tier the project is demonstrable and the git history shows steady, shippable increments.

## 2. Tiers

### Tier 0 - Walking skeleton (~half day)

Goal: prove the integration seam before building on it.

- Go module + `chi` router; `/health`.
- Data contracts as Go structs **and** TypeScript types, mirrored 1:1 from [PRD §14](PRD.md).
- In-memory analysis store.
- `POST /api/analyses` + `GET /api/analyses/{id}` returning a **hardcoded** report.
- Vite + React + TS app that fetches that report and renders one screen.
- CI skeleton green (fmt/vet/build + lint/typecheck/build).

Done when: `curl /health` works, the frontend renders a backend-served report locally, CI is green.

### Tier 1 - Mock-mode demo  ← THE FLOOR (guaranteed deliverable)

Goal: the complete product, end to end, with a deterministic mock pipeline. This is what we protect at all costs.

- Four screens wired to the backend, converted from `design/ui_kits/analyzer/` against the design tokens ([TECHNICAL_DESIGN §12](TECHNICAL_DESIGN.md)).
- Mock pipeline: a goroutine that walks the 10 stages ([PRD §8 step 3](PRD.md)), emitting SSE events on `GET /api/analyses/{id}/events`.
- Deterministic mock report covering **every** section in [TECHNICAL_DESIGN §5](TECHNICAL_DESIGN.md): summary, badges, 4-quadrant matrix, STAR questions, recruiter/hiring-manager summaries, methodology, limitations.
- `GET /api/analyses/{id}/export.md` generated from the report object.
- **Evaluation gates L0 + L1 + L2(mock) pass** (see [EVALUATION.md](EVALUATION.md)).
- Frontend deployed to AWS Amplify ([ADR 0007](adr/0007-aws-amplify-and-container-backend.md)). If Amplify blocks, the floor is still met by a locally runnable demo; deploy is finished in Tier 4.

Done when: a recruiter can complete Job → Candidate → Progress → Report → Export, with no score anywhere, and the eval gates are green in CI.

### Tier 2 - First real reasoning (Gemini), behind `LLMClient`

Goal: prove real agentic reasoning with the **least** external dependency.

- Introduce the `LLMClient` abstraction ([ADR 0011](adr/0011-use-gemini-and-spike-google-adk.md)) with two implementations: `mock` and `gemini`, selected by `ANALYSIS_MODE` ([TECHNICAL_DESIGN §2](TECHNICAL_DESIGN.md)).
- Switch the **text-only** agents to real Gemini first, because they need no file/GitHub ingestion: `JobProfileAgent`, `ResumeEvidenceAgent`, `EvidenceCheckerAgent`, `QuadrantClassifierAgent`, `TechnicalMaturityAnalystAgent` — operating on pasted resume text + job description.
- Two-tier model strategy: fast model for extraction, stronger model for checking/classification/final analyst.
- Each agent keeps a per-agent mock fallback so a single provider failure degrades gracefully instead of breaking the run.

Done when: `ANALYSIS_MODE=gemini` produces a real report from pasted text that passes the same eval gates as mock mode.

### Tier 3 - Evidence ingestion (risky externals, in priority order)

Each item is independent and individually cuttable.

- **3a GitHub-lite (highest value):** metadata + README + manifest detection (languages, `go.mod`/`package.json`/`requirements.txt`/`pyproject.toml`, `Dockerfile`, `.github/workflows/*` presence, test/CI/deploy indicators). **No code sampling yet.** Needs a GitHub token to avoid the 60 req/hr unauthenticated limit ([PRD §22 risk](PRD.md)).
- **3b Go-native PDF text extraction:** upgrade over the always-present paste fallback. Pure Go, OCR off, size limit, timeout ([PRD §16](PRD.md), [ADR 0017](adr/0017-go-native-pdf-extraction.md)). The fallback already satisfies the floor, so PDF upload is pure upside.
- **3c Portfolio mini-crawler (lowest priority):** bounded, no JS, no deep crawl ([TECHNICAL_DESIGN §11](TECHNICAL_DESIGN.md)). First to be cut under time pressure.

Done when: the corresponding `*EvidenceAgent` consumes real ingested signals and the report cites them as sources.

### Tier 4 - Cloud backend + hardening

- Dockerize the Go API; push to ECR; deploy on ECS Express Mode, **or** Render fallback with the reason documented ([ADR 0007](adr/0007-aws-amplify-and-container-backend.md)).
- CloudWatch logs, `/health` check, request timeouts, AWS budget + teardown note.
- One Playwright happy-path E2E with mocked analysis output ([TECHNICAL_DESIGN §15](TECHNICAL_DESIGN.md)).
- `AI_WORKFLOW.md` and the demo dataset.

Done when: the backend is reachable from the deployed frontend via `VITE_API_BASE_URL`, or the fallback is live and documented.

## 3. Cut line (stretch — only if all tiers above are green)

In order of what to attempt first:

1. GitHub **code sampling** (12 files / ~2k lines per repo) — the ambitious half of [TECHNICAL_DESIGN §10](TECHNICAL_DESIGN.md).
2. **ADK spike**, timeboxed *after* Tier 2 works via the Gemini Go SDK. Adopt only if it meets the [ADR 0011](adr/0011-use-gemini-and-spike-google-adk.md) criteria inside the box; otherwise stay on the SDK + `LLMClient`. **The spike is never on the critical path.**
3. Portfolio crawler depth.
4. Persisted reports / S3 / analyst chat (explicitly post-MVP in [PROJECT_SCOPE](../PROJECT_SCOPE.md)).

## 4. Critical path

```text
Tier 0  →  Tier 1 (FLOOR)  →  Tier 2  →  Tier 3a (GitHub-lite)  →  Tier 4 (deploy)
                  │                                                      │
            eval gates green                                      Render fallback
            Amplify (or local)                                   if ECS blocks
```

Everything not on this line (PDF upload, portfolio, code sampling, ADK) is parallelizable or cuttable without breaking the demo.

## 5. Risk register

| Risk | Tier | Trigger to abandon | Fallback |
| --- | --- | --- | --- |
| PDF extraction fidelity too low | 3b | Fixture PDFs extract poorly or complex layouts lose too much text | Paste-text only (already the floor); revisit Docling sidecar post-MVP |
| GitHub API rate limit | 3a | 403/limit without token | Require a token; cache responses; cap repos at 5 |
| ECS Express availability/cost | 4 | Setup blocks > a few hours | Render backend, keep Amplify ([ADR 0007](adr/0007-aws-amplify-and-container-backend.md)) |
| LLM conclusions too strong | 2 | Eval gate L1 fails | Conservative prompts + L1 vocabulary lint blocks the build |
| LLM cost/latency (9 agents/run) | 2 | Slow or expensive runs | Two-tier models; collapse low-value agents into one call; mock the rest |
| ADK adds friction | stretch | Spike box expires | Gemini Go SDK via `LLMClient` |
| Scope creep (chat/DB/login) | all | Any non-goal work starts | Re-read [PROJECT_SCOPE](../PROJECT_SCOPE.md) non-goals |

## 6. Definition of done (project)

The success metrics in [PRD §24](PRD.md), plus: the eval gates in [EVALUATION.md](EVALUATION.md) are green in CI, and every ADR fallback that was triggered is documented in its ADR.
