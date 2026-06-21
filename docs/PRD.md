# PRD - Avaliador Tech Recruiter

Product: Avaliador Tech Recruiter  
Repository: https://github.com/CafeSemCafeina/avaliador-tech-recruiter  
Planned start date: ____ / ____ / ______  
Target deadline: 1 week  
Actual completion date: ____ / ____ / ______  
Status: Planned

## 1. Context

This project is a practical demonstration of AI-native full-stack development applied to technical recruiting.

The goal is to build a small, hosted, testable, and well-documented MVP that shows how an ambiguous hiring problem is turned into a working product: analyzing a candidate's technical maturity from the job posting, resume, GitHub, exported LinkedIn, and portfolio, organizing evidence and interview questions.

The project also serves as proof of process: research, scope definition, architecture, implementation, testing, CI, cloud deployment, documentation, and judicious use of AI agents.

## 2. Challenge goal

Primary goal: build, in up to 1 week, a demonstrable product that shows real capability to deliver software with Go, TypeScript, React, AI, containers, and cloud.

The project should demonstrate:

- the ability to turn business context into a product;
- a real Go backend;
- React + TypeScript + Vite;
- an agentic workflow with a Go-native framework;
- static GitHub analysis;
- document parsing with an open-source solution;
- deployment to AWS Amplify and ECS Express Mode;
- containerization;
- minimal tests;
- CI with GitHub Actions;
- AI-native workflow documentation;
- comfort with Linux, tmux, and SSH;
- product judgment aligned with human recruiting, without a cold score.

If the MVP is planned for 1 week and finished in 2-3 days, record the actual completion date above as evidence of execution speed.

## 3. Problem

Technical recruiters need to evaluate candidates quickly, but the evidence is fragmented:

- resumes contain claims;
- LinkedIn contains public self-reporting;
- GitHub contains code evidence, but requires technical reading;
- portfolios may contain projects and case studies, but also marketing;
- expected seniority changes with the role;
- absence of public evidence does not mean absence of skill.

Score-only screening tools can be fast, but they reduce nuance and may create false verdicts. The proposal here is different: organize evidence and uncertainty to guide a better human interview.

## 4. Target users

### Primary user

A recruiter or talent partner who needs to run an initial technical screening of candidates.

Needs:

- quickly understand whether the candidate appears junior, mid, or senior for a role;
- know which claims are evidenced;
- know which points need validation;
- receive structured technical questions;
- have a clear summary for the hiring manager.

### Secondary user

A technical hiring manager who receives filtered candidates.

Needs:

- understand the candidate's trade-offs;
- see concrete evidence;
- identify technical risks;
- prepare the interview without reading every repository.

## 5. Proposed solution

The Avaliador Tech Recruiter receives a job posting and a set of candidate evidence. It then runs a controlled agentic pipeline that:

1. interprets the ideal technical profile for the role;
2. extracts claims from the resume;
3. extracts signals from the exported LinkedIn;
4. statically analyzes public GitHub repositories;
5. extracts signals from the portfolio;
6. cross-references claims and evidence;
7. classifies findings into a four-quadrant matrix;
8. generates STAR questions;
9. produces a final report for the recruiter and hiring manager.

The product does not make a hiring decision, does not rank candidates, and does not generate a final score.

## 6. Product principles

- Evidence before opinion.
- No final score.
- No automatic verdict.
- Absence of public evidence becomes a question, not an accusation.
- Every important conclusion must cite a source.
- Conservative and professional language.
- The recruiter stays in control.
- The system should accelerate investigation, not replace judgment.

## 7. One-week MVP scope

### Included

- Job wizard.
- Candidate wizard.
- Upload or paste of the resume.
- Upload or paste of the exported LinkedIn/PDF.
- GitHub URL field.
- Optional portfolio URL field.
- Static analysis of public, non-empty GitHub repositories.
- PDF parsing via an open-source tool.
- Agent pipeline with visible stages.
- Final report without a score.
- Four-quadrant matrix.
- Qualitative badges.
- STAR questions.
- Markdown export.
- Technical README.
- PRD in the repository.
- Minimal tests.
- Basic CI.
- Frontend deployment on AWS Amplify.
- Backend container deployment on AWS ECS Express Mode, or a documented fallback if blocked.

### Excluded from the MVP

- Login/authentication.
- Multi-user.
- Robust database.
- Cookie-based LinkedIn scraping.
- Execution of the candidate's repository code.
- Real integration with an external ATS.
- Final score.
- Ranking between candidates.
- Automatic hire/reject decision.
- Full Terraform.
- Kubernetes.

## 8. User flow

### Step 1 - Job

Fields:

- job description;
- minimum seniority: Intern, Junior, Mid, Senior, Staff;
- optional years of experience;
- technology stack tags;
- selection of up to 3 primary stacks;
- optional recruiter notes.

Result:

- ideal technical profile for the role;
- project expectations by seniority;
- required and desirable technical requirements.

### Step 2 - Candidate

Fields:

- resume PDF or text;
- exported LinkedIn PDF/text;
- GitHub URL;
- optional portfolio URL;
- optional notes.

UX note:

LinkedIn must be handled via upload/paste. The UI must explain that the system does not log in, does not use cookies, and does not access private data.

### Step 3 - Analysis

Loading/progress screen with stages:

1. Parsing resume.
2. Extracting role maturity profile.
3. Reading LinkedIn evidence.
4. Analyzing GitHub repositories.
5. Reading portfolio signals.
6. Checking claims against evidence.
7. Building evidence matrix.
8. Generating STAR questions.
9. Running analyst self-review.
10. Finalizing report.

### Step 4 - Result

Blocks:

- executive summary;
- qualitative badges;
- evidence matrix;
- confirmed claims;
- claims that need validation;
- technical gaps;
- STAR questions;
- recruiter summary;
- hiring manager summary;
- Markdown export.

## 9. Matrix model

### Strong with evidence

The candidate declares or demonstrates a competency and there is consistent evidence in the resume, GitHub, LinkedIn, or portfolio.

### Strong, but needs validation

The candidate appears to have a relevant competency, but the evidence is indirect, superficial, or insufficient.

### Weak with evidence

There are concrete signals of a gap relative to the role.

### Weak, but needs validation

There is a signal of a possible weakness, but not enough evidence to conclude.

## 10. Qualitative badges

Examples:

- Seniority Signal: Mid plausible, needs to validate backend ownership.
- Stack Evidence: Strong in React/TypeScript, weak in public Go.
- Project Depth: Moderate.
- Backend Evidence: Needs assessment.
- Public Proof: Mixed.
- Interview Priority: High in backend/deploy.

Badges must not become a numeric score.

## 11. Agent pipeline

### 11.1 JobProfileAgent

Responsibility:

- interpret the job posting;
- map the expected seniority;
- define the ideal technical profile;
- indicate what kind of evidence would be expected.

Output:

- required requirements;
- desirable requirements;
- expectation by seniority;
- technical risks to validate.

### 11.2 ResumeEvidenceAgent

Responsibility:

- extract technical claims from the resume;
- separate skills, experiences, projects, education, tools, and impact;
- mark claims as explicit, vague, or contextual.

### 11.3 LinkedInEvidenceAgent

Responsibility:

- extract experiences, certifications, education, skills, and activity from the exported LinkedIn;
- compare signals with the resume;
- treat LinkedIn as public self-reporting, not absolute truth.

### 11.4 GitHubEvidenceAgent

Responsibility:

- analyze public, non-empty repositories;
- detect languages, frameworks, READMEs, structure, tests, Dockerfile, CI, and deploy signals;
- distinguish an original project, fork, tutorial, or inconclusive repository;
- not execute code.

### 11.5 PortfolioEvidenceAgent

Responsibility:

- extract text and links from the portfolio;
- identify projects, declared stacks, deploys, and case studies;
- cross-reference signals with GitHub and the resume.

### 11.6 EvidenceCheckerAgent

Responsibility:

- cross-reference the role requirements with the candidate's evidence;
- classify claims as confirmed, plausible, unverified, weak, or conflicting;
- avoid accusations of exaggeration without basis.

### 11.7 QuadrantClassifierAgent

Responsibility:

- turn findings into the four-quadrant matrix;
- keep a source, rationale, and validation question for each item.

### 11.8 STARQuestionAgent

Responsibility:

- generate technical STAR questions;
- include follow-ups;
- indicate what a good answer should reveal;
- avoid accusatory language.

### 11.9 TechnicalMaturityAnalystAgent

Responsibility:

- make the final technical maturity judgment without a score;
- review consistency;
- point out caveats;
- write the final report.

Mandatory self-check:

- am I confusing absence of evidence with absence of skill?
- does each conclusion have a source?
- am I using a disguised score?
- has each weakness become an investigable question?
- was seniority considered correctly?

## 12. Technical architecture

```text
AWS Amplify
  React + TypeScript + Vite frontend
        |
        v
AWS ECS Express Mode
  Go API container
  Eino/agent workflow
  Doc parsing worker
  GitHub static analyzer
        |
        v
AI provider
  Evidence reasoning
  STAR questions
  Report generation
```

### Frontend

- React;
- TypeScript;
- Vite;
- input wizard;
- progress screen;
- result screen;
- Markdown export.

### Backend

- Go HTTP API;
- endpoints to start an analysis, query status, and fetch the report;
- controlled agentic pipeline;
- document parsing;
- GitHub static analysis;
- structured logs.

### Cloud

- Amplify for the frontend;
- ECR for the Docker image;
- ECS Express Mode for the backend container;
- CloudWatch for logs;
- S3 optional for uploads/exports.

## 13. Initial endpoints

```text
GET  /health
POST /api/analyses
GET  /api/analyses/{id}
GET  /api/analyses/{id}/events
GET  /api/analyses/{id}/export.md
```

`GET /api/analyses/{id}` returns the analysis status and, once complete, the structured report. `GET /api/analyses/{id}/events` is a Server-Sent Events stream of stage progress.

The flow must be asynchronous, or simulate asynchrony with per-stage status, to avoid long requests and to show the agentic pipeline.

## 14. Data and contracts

### JobInput

```json
{
  "description": "",
  "seniority": "intern|junior|mid|senior|staff",
  "yearsExperience": null,
  "stackTags": [],
  "primaryStacks": [],
  "notes": ""
}
```

### CandidateInput

```json
{
  "resumeText": "",
  "linkedinText": "",
  "githubUrl": "",
  "portfolioUrl": "",
  "notes": ""
}
```

### QuadrantItem

```json
{
  "title": "",
  "quadrant": "strong_with_evidence|strong_needs_validation|weak_with_evidence|weak_needs_validation",
  "sources": [],
  "rationale": "",
  "interviewFocus": ""
}
```

## 15. GitHub static analysis

The MVP must analyze publicly:

- non-empty repositories;
- languages;
- README;
- `package.json`;
- `go.mod`;
- `requirements.txt`;
- `pyproject.toml`;
- `Dockerfile`;
- folder structure;
- test indicators;
- CI indicators;
- deploy indicators.

The MVP must not:

- execute code;
- run install scripts;
- run external repository tests;
- clone and execute projects without a sandbox.

## 16. PDF and documents

Document parsing must use a ready-made open-source solution. Preference:

- Go-native PDF text extraction as the first option (ADR 0017);
- fallback to pasted/manual text;
- OCR disabled by default;
- size limit;
- timeout;
- failure logs.

## 17. Testing

### Backend

- unit tests for stack normalization;
- tests for quadrant classification;
- tests for STAR question generation with mocks;
- HTTP handler tests;
- fixtures for GitHub analysis;
- mocked LLM calls.

### Frontend

- tag tests;
- test for selecting up to 3 primary stacks;
- test for matrix rendering;
- test for the API client with a mocked fetch.

### E2E

One Playwright flow:

1. fill in the job;
2. fill in a fake candidate;
3. start the analysis;
4. watch progress;
5. view the mocked report;
6. export Markdown.

## 18. Minimal CI

GitHub Actions:

- Go fmt/vet/test/build;
- frontend lint/typecheck/test/build;
- Docker build;
- secret scanning;
- govulncheck, if it does not slow things down;
- backend deploy separate and manual/main-only.

## 19. Skills and rubrics

### Skills for the coding agent

Create skills in the repository to guide AI-native work:

- `tech-maturity-project`;
- `evidence-matrix-analyst`;
- `aws-ecs-express-deploy`.

### Internal agent rubrics

Create knowledge files:

- `evidence_policy.md`;
- `seniority.md`;
- `star_method.md`;
- `stack_taxonomy.json`.

## 20. Linux, tmux, and SSH workflow

Preferred development in WSL/Ubuntu.

Planned use of tmux:

- backend window;
- frontend window;
- tests window;
- infra window;
- logs window;
- git window.

SSH:

- GitHub access via SSH key;
- optional: smoke test on a temporary EC2, if there is time.

## 21. Deployment

### Frontend

- AWS Amplify;
- `VITE_API_BASE_URL` variable;
- deploy via GitHub.

### Backend

- Dockerfile;
- push to ECR;
- ECS Express Mode;
- logs in CloudWatch;
- health check `/health`;
- env vars for the AI provider and optional GitHub token.

### Fallback

If ECS Express Mode is blocked by availability, use Render for the backend and document the reason. Amplify remains the AWS frontend.

## 22. Risks

- PDF extraction losing fidelity on complex layouts.
- ECS Express Mode generating higher-than-expected cost.
- LLM generating conclusions that are too strong.
- GitHub API rate limit.
- Poorly extracted resume PDF.
- Scope creep from chat, database, login, or scraping features.

## 23. Mitigations

- fallback to pasted text;
- PDF size limit;
- no OCR in the MVP;
- no execution of third-party code;
- conservative prompts;
- structured outputs;
- tests with mocks;
- AWS budgets;
- delete cloud resources if unused.

## 24. Success metrics

The MVP will be considered successful if it:

- is published on GitHub;
- has a clear README;
- runs locally;
- has a demonstrable end-to-end flow;
- generates an evidence matrix without a score;
- generates STAR questions;
- has minimal tests;
- has green CI;
- has at least the frontend hosted on AWS;
- has a containerized backend;
- has a backend deploy on ECS Express Mode or a justified fallback;
- has documentation of decisions and trade-offs.

## 25. Narrative for evaluators

This project should be presented as proof of a way of working:

> I built a small AI-native recruiting prototype around evidence-first technical maturity analysis. The system avoids cold match scores and instead produces a human-reviewable evidence matrix with STAR interview questions. I used Go, React, TypeScript, Vite, containers, AWS Amplify/ECS, static GitHub analysis, document parsing, tests, CI, and an agentic workflow with conservative reasoning.

## 26. Suggested roadmap

### Day 1

- scaffold frontend/backend;
- data contracts;
- job/candidate screen;
- updated README;
- health endpoint.

### Day 2

- mocked agent pipeline;
- matrix and report;
- Markdown export;
- initial tests.

### Day 3

- GitHub static analysis;
- Go-native PDF/text fallback;
- prompts/rubrics.

### Day 4

- polished frontend;
- progress flow;
- STAR questions;
- analyst agent self-review.

### Day 5

- Docker;
- CI;
- Amplify deploy;
- prepare ECR/ECS.

### Day 6

- backend deploy;
- CloudWatch/logs;
- timeout and upload adjustments.

### Day 7

- hardening;
- demo dataset;
- AI_WORKFLOW.md;
- video or presentation script;
- final review.
