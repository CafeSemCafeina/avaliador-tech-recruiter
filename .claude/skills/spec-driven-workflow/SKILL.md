---
name: spec-driven-workflow
description: The build workflow for avaliador-tech-recruiter — risk-ordered tiers with a protected mock-mode floor, a Ready spec required before any unit is implemented, eval gates (L0 contract / L1 policy / L2 fixtures) as the merge filter, package partitioning for parallel agents, atomic Conventional Commits, and never pushing to main without explicit confirmation. Use when starting any implementation unit, deciding what to build next, splitting work across agents, opening/merging a branch, or committing. Triggers on specs/, tiers, eval gates, "what should I build next", branching, or commit/push.
---

# Spec-driven build workflow (avaliador-tech-recruiter)

Authoritative sources: [docs/EXECUTION_PLAN.md](../../../docs/EXECUTION_PLAN.md), [docs/EVALUATION.md](../../../docs/EVALUATION.md), [specs/README.md](../../../specs/README.md), [docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md](../../../docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md), [docs/adr/0014-spec-layer-implementation-contracts.md](../../../docs/adr/0014-spec-layer-implementation-contracts.md).

## The loop for any unit of work
1. **Find/confirm the spec is `Ready`.** Do not implement a unit before its spec under `specs/` is `Ready`. If only `Draft` exists, get it reviewed/promoted first; if no spec exists, write one from the template (`specs/000-template.md`) citing the PRD/TD/ADRs it depends on — do not let it drift from those.
2. **Build to the acceptance criteria.** Each AC is tagged to an eval gate (`[L0]` contract, `[L1]` policy, `[L2]` golden fixtures). Implement only what the spec owns (its "Partition (paths this spec owns)") to stay conflict-free with parallel work.
3. **Make the gate green.** The spec's "Done when" is an eval command (typically `go test ./...` plus the relevant gate). The **eval gate — not eyeballing — is the merge filter.** A change is not mergeable until its eval command passes on the integration branch.
4. **Commit atomically, then ask before pushing.** One self-contained unit per Conventional Commit (`feat(api): ...`, `test(eval): ...`); never batch unrelated changes. **Never `git push` to `main` without explicit confirmation** — commit freely locally and proactively ask when the tree is push-worthy.

## Tier order (risk-ordered, not chronological)
Build in the EXECUTION_PLAN tiers. **Tier 1 mock-mode is the protected floor**: it must work end-to-end before any real LLM, GitHub, PDF, or cloud dependency is added. Tier 0 (contracts + eval seam) is **serial/inline** and must be frozen before parallel work begins. Then add fidelity in risk order — Gemini text agents → GitHub-lite → Docling → portfolio — each behind a documented fallback.

## Eval gates (default suite stays offline)
- **L0 contract** — types/round-trip/structural no-score checks.
- **L1 policy** — the evidence-policy validator (see the `evidence-policy-guard` skill).
- **L2 golden fixtures** — deterministic mock output asserted against committed expectations.
- L3 (LLM-judge) and L4 (manual) are nightly/manual, never in the default suite. **Live model/GitHub/cloud calls never run in the default test suite — mock them.**

## Parallel / swarm execution (ADR-0013)
Contracts and eval gates must exist and be **frozen before** fan-out. Partition new work by package/directory (each spec names its owned paths) so specialists in separate worktrees don't collide. The orchestrator owns the contracts, the `LLMClient`/eval seam, and merges; the merge filter is the eval command, so imprecision costs a retry, not a shipped defect.

## When picking the next thing to build
Prefer the lowest-tier unfrozen seam first (contracts before anything; spec 001 first). Within a tier, prefer specs that unblock the most others. Never start a unit whose spec is not `Ready` or whose dependencies' specs are not satisfied.
