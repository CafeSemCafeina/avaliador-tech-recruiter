---
name: evidence-policy-guard
description: The product's non-negotiable output policy for avaliador-tech-recruiter — never emit a match score, ranking, or hire/reject verdict; conservative uncertainty-preserving language; missing public evidence becomes an interview-validation item, never a gap; enforced forbidden-vocabulary list; evidence-sourcing and quadrant rules; no demographic inference. Use whenever generating, classifying, rendering, exporting, or reviewing ANY analysis output, report text, agent prompt/rubric, or policy validator code. Triggers on report content, quadrant classification, STAR questions, forbidden vocabulary, scoring, fairness, or the no-score principle.
---

# Evidence-first output policy (the core identity)

Authoritative sources: [docs/adr/0002-evidence-first-no-final-score.md](../../../docs/adr/0002-evidence-first-no-final-score.md), [docs/EVALUATION.md](../../../docs/EVALUATION.md) (L0/L1), [docs/PRD.md](../../../docs/PRD.md) §6/§9/§11.9, and [specs/004-report-generation-policy.md](../../../specs/004-report-generation-policy.md). This is **machine-enforced**, not good intentions: the validator runs in the request path and in CI, and a violation fails the analysis — the report is never served.

## The five hard rules
1. **No score, ranking, or verdict.** No field named `score`/`rating`/`fit`/`percentage`; no numeric fit value anywhere in output, payload, or UI. No hire/reject/pass-fail conclusion.
2. **Conservative, uncertainty-preserving language.** Prefer "Needs validation", "Public evidence suggests", "Not publicly evidenced". Avoid asserting certainty the evidence doesn't support.
3. **Missing public evidence is an interview-validation item, never a gap.** An item with no source may **not** be classified `weak_with_evidence`; it goes to a `*_needs_validation` quadrant or surfaces as `interviewFocus`.
4. **Every conclusion is sourced.** Any quadrant item or strong/weak conclusion must cite ≥1 concrete `Source`. `weak_with_evidence` with empty `sources` is invalid.
5. **No demographic inference.** Never reference or infer age, gender, ethnicity, nationality, or other protected attributes.

## Forbidden vocabulary — single source of truth
The canonical list lives in **one** place (`design/readme.md`), shared by this validator and the agent prompt rubrics so prompt and check never diverge. Seed terms (case-insensitive): *Failed, Bad candidate, Unqualified, No experience, Match score, Hire, Reject, Pass/fail*. When adding a term, add it to the single shared source — never inline a second copy.

## Quadrant model
`QuadrantItem.quadrant ∈ {strong_with_evidence, strong_needs_validation, weak_with_evidence, weak_needs_validation}`. The `*_with_evidence` values require sources; the `*_needs_validation` values are where unsourced or unverified signals live. Each item carries `title`, `rationale`, `sources`, `interviewFocus`.

## Applying this skill
- **Writing report/agent text:** phrase to rules 1–2; route unsourced claims per rule 3; attach `Source`s per rule 4; scrub demographic references per rule 5; never use a forbidden term.
- **Writing the validator (spec 004):** scan vocabulary (case-insensitive, all text fields), numeric/score fields and values, sourcing rules, quadrant rules, seniority echo (output must match `JobInput.seniority`), and demographic inference → return structured violations (path + rule + offending text). The runner treats any violation as a failed analysis.
- **Rendering/exporting:** the renderer and Markdown export must not introduce a violation or display a numeric fit value even if present in the payload.

When in doubt, choose the more conservative wording and push the uncertainty to an interview-validation item. Erring toward caution is always correct here.
