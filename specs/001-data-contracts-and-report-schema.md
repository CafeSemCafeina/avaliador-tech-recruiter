# Spec 001: Data contracts & report schema (the seam)

- **Tier:** 0
- **Status:** In progress (Go contracts + L0 tests done; TS round-trip vitest lands with the frontend scaffold)
- **Related to:** PRD §14; TECHNICAL_DESIGN §5, §6; ADR-0002; ADR-0013; EVALUATION L0
- **Estimate:** M
- **Owner engine:** orchestrator (this is the seam the whole system depends on)
- **Partition (paths this spec owns):** Go contract package (e.g. `backend/internal/contract/`), TS types (e.g. `frontend/src/types/contract.ts`)
- **Depends on:** —

## Objective

Define and freeze the data contracts every other unit depends on: the two inputs (`JobInput`, `CandidateInput`), the `QuadrantItem`, and the full structured `Report`. These are mirrored 1:1 as Go structs and TypeScript types so backend and frontend share one shape, and the frontend renders from the report JSON — never from the Markdown export. This spec exists first because nothing can be built in parallel until the seam is frozen.

## Non-objectives

- Validation rules and HTTP behavior (spec 002).
- How the report is produced (specs 003/004).
- Persistence (the store is in-memory; spec 002).

## Technical context

- Inputs: `JobInput` and `CandidateInput` exactly as in PRD §14. `seniority` enum is `intern|junior|mid|senior|staff`. `primaryStacks` is a subset of `stackTags`, max 3. `yearsExperience` is nullable.
- `QuadrantItem` (PRD §14): `title`, `quadrant` (`strong_with_evidence|strong_needs_validation|weak_with_evidence|weak_needs_validation`), `sources` (string[]), `rationale`, `interviewFocus`. Optional `starRefs` (TECHNICAL_DESIGN §6).
- `Report` carries every section in TECHNICAL_DESIGN §5: executive summary, qualitative badges, four-quadrant matrix (`QuadrantItem[]`), confirmed strengths, strengths needing validation, confirmed gaps, weak signals needing validation, STAR questions, recruiter summary, hiring manager summary, methodology, limitations.
- A `Source` is a typed reference (e.g. `{ kind: "resume"|"github"|"linkedin"|"portfolio"|"job", detail: string }`) so L1 sourcing checks can be mechanical.
- Go structs and TS types must serialize to identical JSON (same field names, camelCase on the wire).

## Acceptance criteria

- **AC1** [L0] Given a Go-produced `Report`, when serialized to JSON and parsed by the TS type, then it round-trips with no field mismatch (shared fixture asserts this both ways).
- **AC2** [L0] The contract types contain **no** field named `score`, `rating`, `fit`, or `percentage`, and no numeric fit value field anywhere — enforced by a structural test over the type definitions (ADR-0002).
- **AC3** [L0] Given any `QuadrantItem`, the type requires `title`, a valid `quadrant` enum value, `sources` (≥0), `rationale`, and `interviewFocus`; an invalid `quadrant` value fails to deserialize.
- **AC4** [L0] The `Report` type cannot be constructed missing any of the TECHNICAL_DESIGN §5 sections (all sections are required fields).
- **AC5** [L0] `seniority` accepts exactly the five enum values and rejects any other.

## Tasks

- [ ] Define Go structs for `JobInput`, `CandidateInput`, `Source`, `QuadrantItem`, `Report` with JSON tags.
- [ ] Define the mirrored TypeScript types/enums.
- [ ] [P] Add a committed shared JSON fixture of a complete `Report` and a round-trip test (Go marshal → TS parse, TS shape → Go unmarshal).
- [ ] [P] Add the structural "no forbidden numeric/score field" test over the contract types (L0).
- [ ] Document the camelCase wire convention next to the types.

## Done when

The contract package builds in Go and TS, the round-trip fixture test passes, and the L0 structural checks (AC2–AC5) pass in CI.
