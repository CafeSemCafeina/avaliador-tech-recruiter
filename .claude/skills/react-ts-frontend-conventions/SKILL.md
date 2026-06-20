---
name: react-ts-frontend-conventions
description: Conventions for the avaliador-tech-recruiter frontend (single-page React + TypeScript + Vite, useReducer state, no React Router in MVP, renders from structured Report JSON, design-token styling). Use when writing, reviewing, or scaffolding any frontend code in this repo — the four screens (Job Input, Candidate Evidence, Analysis Progress, Report), SSE consumption, the contract TS types, state management, or styling with the design system. Triggers on .tsx/.ts under frontend/, Vite, useReducer, SSE/EventSource, design tokens, or "frontend conventions" requests.
---

# Frontend conventions (avaliador-tech-recruiter)

Authoritative sources: [docs/TECHNICAL_DESIGN.md](../../../docs/TECHNICAL_DESIGN.md) §12, [docs/PRD.md](../../../docs/PRD.md) §7–§9, the design system under `design/` (entry `design/styles.css`; canonical screens `design/ui_kits/analyzer/`), and the Tier 1 specs.

## Non-negotiables (these fail review)
- **Render from the structured `Report` JSON — never parse the Markdown export to build the UI.** The Markdown export is a separate durable artifact, not a UI source.
- **No score/ranking/verdict shown, ever** (ADR-0002). The report renderer must not display a numeric fit value even if one somehow appears in the payload (spec 004 frontend guard). Copy stays conservative/uncertainty-preserving ("Needs validation", "Public evidence suggests", "Not publicly evidenced") — never "gap" for missing evidence; that's an interview-validation item.
- **TS contract types mirror the Go structs 1:1** (spec 001), camelCase, shared shape. Keep them in one place (e.g. `frontend/src/types/contract.ts`); do not hand-edit them out of sync with the backend.

## Stack
- Single-page **React + TypeScript + Vite**. State via **`useReducer`** (the analysis lifecycle is a state machine; model it as one). **No React Router in the first MVP** — the four screens are steps in one flow, driven by reducer state, not routes.
- Four screens in order: **Job Input → Candidate Evidence → Analysis Progress → Report** (`design/ui_kits/analyzer/` is the canonical layout/density/copy reference).

## Data flow
- `POST /api/analyses` → get `analysisId`; open an `EventSource` on `GET /api/analyses/{id}/events` to drive the progress screen (ten stages, pending → running → completed/warning). Close it on terminal state.
- On completion, fetch `GET /api/analyses/{id}` for the `Report` and render the report screen from it. Offer the Markdown via `GET /api/analyses/{id}/export.md` as a download/link — do not reconstruct the UI from it.
- Validate inputs client-side to match server rules (seniority enum; `primaryStacks ⊆ stackTags`, ≤3) but treat the server's field errors as authoritative.

## Styling
- Use the **CSS custom properties in `design/tokens/`** — never raw hex. Component primitives live in `design/components/<group>/`; full rules in `design/readme.md` and `design/SKILL.md`.
- **Lucide outline icons, 1.75 stroke. No emoji, no gradients, no marketing-hero styling.** Keep density and copy faithful to the analyzer UI kit.

## Style & tests
- Functional components + hooks; typed props (no `any`); discriminated unions for reducer actions and for the four-quadrant item kinds. Keep components rendering-from-data and side-effect-light; isolate SSE/fetch in hooks.
- Test the reducer (pure) and the report renderer against the shared contract fixture (the same `Report` fixture the Go round-trip uses). Run lint + typecheck + tests before committing; commit atomically; do not push to `main` without confirmation.
