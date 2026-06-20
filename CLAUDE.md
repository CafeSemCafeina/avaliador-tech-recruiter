# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repo is **pre-implementation**: it currently contains only product/architecture docs and an exported design system. There is no `package.json`, `go.mod`, build, or test runner yet. The documents under `docs/` are not background reading — they are the binding specification the code must implement. Read them before writing code; treat conflicts between code and docs as bugs in the code.

When you scaffold the implementation, follow the stack and structure fixed by the docs (do not re-decide them):
- **Backend:** Go + `chi`, in-memory store, SSE for progress, JSON-first contracts ([docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) §3).
- **Frontend:** single-page React + TypeScript + Vite, `useReducer` for state, no React Router in the first MVP ([docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) §12).
- The planned dev commands (Go fmt/vet/test/build; frontend lint/typecheck/test/build; Docker build) are defined in [docs/PRD.md](docs/PRD.md) §18 and [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) §16. Wire these into CI as they are built; this section should be updated with the real invocations (including how to run a single test) once the toolchain exists.

## Product constraints (non-negotiable — enforced, not just guidance)

This product **never** outputs a match score, a ranking, or a hire/reject verdict. This is the core identity ([docs/adr/0002-evidence-first-no-final-score.md](docs/adr/0002-evidence-first-no-final-score.md)), and it is meant to be **machine-enforced**, not left to good intentions:

- No field named `score`/`rating`/`fit`/`percentage`; no numeric fit value anywhere in output or UI.
- Language stays conservative and uncertainty-preserving ("Needs validation", "Public evidence suggests", "Not publicly evidenced").
- Missing public evidence becomes an interview-validation item, never a gap. An item with no source may not be classified `weak_with_evidence`.
- Forbidden vocabulary (e.g. *Failed, Unqualified, No experience, Match score, Hire, Reject, Pass/fail*) fails the build. The canonical list lives in `design/readme.md`.

These rules are specified as automated gates in [docs/EVALUATION.md](docs/EVALUATION.md) (layers L0/L1). Keep the forbidden-vocabulary list in **one** place, shared by the validator and the agent prompt rubrics, so prompt and check never diverge.

## The contract seam

The data contracts in [docs/PRD.md](docs/PRD.md) §14 (`JobInput`, `CandidateInput`, `QuadrantItem`) and the report sections in [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) §5 are the **seam** the whole system is organized around. Mirror them 1:1 as Go structs and TypeScript types, freeze them early, and let everything else depend on them. The frontend renders from the structured report JSON — it must **not** parse the Markdown export to build the UI.

The analysis runs as a controlled, ordered pipeline of nine agents (`JobProfileAgent` → … → `TechnicalMaturityAnalystAgent`), not a free-form autonomous agent ([docs/adr/0003-controlled-go-native-agent-pipeline.md](docs/adr/0003-controlled-go-native-agent-pipeline.md), [docs/PRD.md](docs/PRD.md) §11). Two runtime modes selected by `ANALYSIS_MODE`: `mock` (deterministic, default) and `gemini` (real). The UI never exposes the toggle. All LLM access goes through an `LLMClient` abstraction so a provider can be swapped and mocked in tests ([docs/adr/0011-use-gemini-and-spike-google-adk.md](docs/adr/0011-use-gemini-and-spike-google-adk.md)).

## How to build this (execution order and gates)

Build in the risk-ordered tiers in [docs/EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md), not the chronological day-roadmap. The rule that overrides everything: **the mock-mode demo (Tier 1) is the protected floor** — it must work end to end before any real LLM, GitHub, PDF, or cloud dependency is added. Add real fidelity in risk order (Gemini text agents → GitHub-lite → Docling → portfolio), each behind a documented fallback.

A tier is "done" only when the evaluation gates (L0 contract + L1 policy + L2 mock fixtures, [docs/EVALUATION.md](docs/EVALUATION.md)) are green in CI. Live model/GitHub/cloud calls never run in the default test suite — mock them.

Each unit of work has a **spec** under `specs/` (see `specs/README.md`, format in [docs/adr/0014-spec-layer-implementation-contracts.md](docs/adr/0014-spec-layer-implementation-contracts.md)). A spec defines behavior with acceptance criteria mapped to the eval gates, names the paths it owns, and ends with a "Done when" eval command. **Do not implement a unit before its spec is `Ready`**, and do not let a spec drift from the PRD/TD/ADRs it cites. Specs 001–005 cover the Tier 1 floor; the contract-seam spec (001) is frozen first.

## Agentic development workflow

This codebase is built primarily by AI agents using a **hybrid orchestrator-plus-specialist** model ([docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md](docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md)): a precise orchestrator owns the contracts, the `LLMClient`/eval seam, and merges; specialist workers fan out on partitioned packages in separate git worktrees, gated by the eval suite. Practical consequences when operating here:

- The contracts and eval gates must exist and be frozen **before** parallel work begins (Tier 0 is serial/inline).
- Partition new work by package/directory to avoid conflicts; the eval gate — not eyeballing — is the merge filter.
- A change is not mergeable until its eval command passes on the integration branch.

## Design system

The UI is built from the exported design system under `design/` (entry: `design/styles.css`, which `@import`s `design/tokens/*`). Design with the CSS custom properties in `design/tokens/`, never raw hex. The canonical layout/density/copy reference is `design/ui_kits/analyzer/` (the four screens: Job Input → Candidate Evidence → Analysis Progress → Report); component primitives are in `design/components/<group>/`. Full rules: `design/readme.md` and `design/SKILL.md`. Iconography is Lucide outline (1.75 stroke); no emoji, no gradients, no marketing-hero styling.

## Conventions observed in this repo

- **Commits:** Conventional Commits with scopes (`feat(core): ...`, `docs(adr): ...`). **Commit atomically** — every self-contained unit of work (one fix, one doc, one spec, one package) is its own commit; do not batch unrelated changes. Commit freely as work completes.
- **Pushing to `main` requires explicit confirmation.** Never `git push` to `main` until the user confirms it. Commit as much as needed locally; when the tree is at a clean, push-worthy point, *ask* whether to push — don't wait silently.
- **Decisions are recorded as ADRs** under `docs/adr/` (numbered, with Context / Decision / Alternatives / Consequences / Validation). When a decision changes or an ADR fallback is triggered, update the ADR rather than leaving it stale — the docs are kept in sync as a hard rule.
- **No personal candidate data is ever committed.** Test fixtures are fictitious ([docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) §13). Design/build exports are unpacked into the repo, not committed as `*.zip` (gitignored).
