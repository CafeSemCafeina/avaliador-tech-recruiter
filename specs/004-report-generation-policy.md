# Spec 004: Report generation policy

- **Tier:** 1
- **Status:** In progress (Go validator + L0/L1 tests done; runner wiring lands with spec 002, frontend numeric guard with the UI)
- **Related to:** PRD §6, §9, §11.9; TECHNICAL_DESIGN §5, §6; ADR-0002; EVALUATION L0/L1
- **Estimate:** M
- **Owner engine:** orchestrator (eval-critical: encodes the product's core constraint)
- **Partition (paths this spec owns):** Go eval/policy package (e.g. `backend/internal/eval/`); shared forbidden-vocabulary source
- **Depends on:** spec 001

## Objective

Implement the policy validator that enforces the product's non-negotiable output rules on any `Report`, in any mode. This is the executable form of the analyst self-check (PRD §11.9) and the no-score principle (ADR-0002): it is the L0/L1 gate that every report must pass before it is returned or exported. It runs in CI and inside the request path so a non-compliant report is never served.

## Non-objectives

- Producing report content (specs 003 for mock, Tier 2 for gemini).
- Subjective quality/fairness judging via a model (EVALUATION L3, manual/nightly, not here).

## Technical context

- The forbidden-vocabulary list lives in **one** place (shared by this validator and the agent prompt rubrics, e.g. `evidence_policy.md`) so prompt and check never diverge (CLAUDE.md rule). Seed list (canonical in `design/readme.md`): *Failed, Bad candidate, Unqualified, No experience, Match score, Hire, Reject, Pass/fail*.
- The validator takes a `Report` and returns structured violations (path + rule + offending text). The runner (spec 002) treats any violation as a failed analysis rather than serving the report.
- Quadrant rules from PRD §9 / TECHNICAL_DESIGN §6: a `weak_with_evidence` item requires ≥1 concrete source; an item with no source must be `*_needs_validation` or surface as `interviewFocus`.

## Acceptance criteria

- **AC1** [L0] Given a report containing any forbidden-vocabulary term (case-insensitive) in any text field, when validated, then a violation is returned and the report is rejected.
- **AC2** [L0] Given a report with any numeric fit/score value or a `score`/`rating`/`fit`/`percentage` field, when validated, then it is rejected (defense-in-depth over spec 001's structural check).
- **AC3** [L1] Given a `weak_with_evidence` item with an empty `sources`, when validated, then it is rejected ("missing evidence is not a gap").
- **AC4** [L1] Given any quadrant item or strong/weak conclusion with no source, when validated, then it is rejected (sourcing rule).
- **AC5** [L1] Given a report whose seniority handling differs from the `JobInput.seniority`, when validated, then it is flagged.
- **AC6** [L1] Given a report referencing demographic/protected attributes (age, gender, ethnicity, nationality), when validated, then it is rejected.
- **AC7** A compliant mock report (spec 003) passes the validator with zero violations.

## Tasks

- [ ] Single source for the forbidden-vocabulary list; loader shared with rubric files.
- [ ] Validator over `Report`: vocabulary scan, numeric/score scan, sourcing rules, quadrant rules, seniority echo, demographic-inference scan → structured violations.
- [ ] Wire the validator into the runner (spec 002) so violations fail the analysis.
- [ ] [P] Unit tests for AC1–AC6 with crafted non-compliant reports.
- [ ] [P] Test that the spec 003 mock report passes clean (AC7).
- [ ] [P] Frontend guard: report renderer never displays a numeric fit value even if present in the payload.

## Done when

`go test ./...` passes AC1–AC7; the validator is invoked in the request path; the shared vocabulary list has exactly one definition in the repo.
