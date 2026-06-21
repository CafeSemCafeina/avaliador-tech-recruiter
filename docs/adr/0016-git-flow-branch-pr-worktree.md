# ADR 0016 - Git flow: branch → PR, cohesive units, worktree isolation

Status: Accepted
Date: 2026-06-21

## Context

The repo is built mostly by AI agents, increasingly in parallel via the
orchestration layer ([ADR-0013](0013-hybrid-orchestrator-specialist-agent-workflow.md),
[ADR-0015](0015-agent-orchestration-tooling.md)). Early Tier 1 work committed
directly to `main`; conventions for branching, PR scope, and worktree layout were
scattered across CLAUDE.md and the orchestration scripts and not coherent.

A sibling project (`CafeSemCafeina/copia-e-cola`) already runs a tight, cohesive
git flow for agents (its `AGENTS.md` / `CONTRIBUTING.md` / agent-worktree ADR).
We adopt the same model here, adapted to this repo (English; the no-score policy;
the eval gates as the merge filter).

## Decision

**1. Branch → PR, always.** Never commit directly to `main`, even for trivial
changes. One branch per subject, type-prefixed (`docs/ fix/ feat/ chore/ refactor/`).

**2. The PR unit is one cohesive, mergeable logical change** — the criterion is
cohesion, not size. Don't mix subjects (fix vs refactor vs feature) in one PR. A
large PR is justified only when the change is indivisible.

**3. Conventional Commits, atomic**, with scopes. Unrelated working-tree changes
are preserved and kept out of the task's commit.

**4. The eval gate is the merge filter.** A change merges only when its gate is
green (`orchestration/gate.ps1` / `go test ./...`); live calls stay out of the
default suite.

**5. Worktree isolation for parallel work.** Each spec/task/agent works in its own
git worktree under `.worktrees/spec-<id>-<engine>` on a `<engine>/spec-<id>`
branch. A branch alone isolates history, not the physical checkout. Worktrees do
not isolate credentials, global caches, or dev-server ports — use temporary ports
per agent. Cleanup: `git worktree remove` + `git branch -d` + `git worktree prune`.

**6. Automation.** "Delete branch on merge" is enabled on GitHub; the `git cleanup`
global alias prunes local merged branches. Agents do not push to `main` or merge
their own PRs without explicit human confirmation.

The flow lives in [CONTRIBUTING.md](../../CONTRIBUTING.md) (canonical),
[AGENTS.md](../../AGENTS.md) (engine-agnostic), [CLAUDE.md](../../CLAUDE.md)
(Claude Code), and the [PR template](../../.github/pull_request_template.md).

## Alternatives considered

- **Commit-to-main with push confirmation** (the prior CLAUDE.md rule) — simpler
  but loses reviewable, isolated history and conflicts with parallel agents.
- **Branch per PR but shared checkout** — branches isolate history, not the
  working tree; concurrent agents in one checkout interfere (`git switch` races,
  mixed uncommitted files). Rejected for parallel work.
- **GitHub Flow without the cohesion rule** — allows large mixed PRs; we keep the
  explicit "one subject per PR" guard.

## Consequences

Positive: small auditable diffs; conflict-free parallel agents; the gate is the
mechanical merge filter; consistent with the sibling project's proven flow.

Negative: more branches/PRs (even for tiny changes); one folder per parallel task;
the prior "commit on main, ask before push" habit is superseded — update muscle memory.

## Validation

`CONTRIBUTING.md`, `AGENTS.md`, the PR template, and the orchestration scripts all
describe the same conventions (`.worktrees/spec-<id>-<engine>`, `<engine>/spec-<id>`);
`orchestration/dispatch.ps1` and `swarm.ps1` create exactly those; `git cleanup`
and delete-branch-on-merge are configured.
