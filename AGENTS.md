# AGENTS.md

Behavior instructions for AI agents (Codex, Gemini/Antigravity, and similar)
working in this repository. Claude Code also reads [CLAUDE.md](CLAUDE.md); the
full human workflow is in [CONTRIBUTING.md](CONTRIBUTING.md). When these conflict,
the order of precedence is: product non-negotiables → CONTRIBUTING git flow →
this file.

## Language

Write code, commits, PRs, and docs in **English** — the rest of the repository
(PRD, Technical Design, ADRs, specs) is in English; keep it consistent.

## Git flow and pull requests

The unit of a PR is **one cohesive, mergeable logical change** — cohesion, not size.

- **Never commit directly to `main`. Always `branch → PR`**, even for trivial changes.
- One branch per subject, type-prefixed: `docs/…`, `fix/…`, `feat/…`, `chore/…`, `refactor/…`.
- Don't mix subjects in one PR. Separate fix, refactor, and feature.
- [Conventional Commits](https://www.conventionalcommits.org/) with scopes. Commit
  small and atomic per coherent slice of work.
- Unrelated changes seen in the working tree must be preserved and must NOT enter
  your task's commit.
- Fill the [PR template](.github/pull_request_template.md).
- A change is mergeable only when its eval gate is green (`orchestration/gate.ps1`,
  or `cd backend && go test ./...` for backend-only work). The gate is the merge filter.
- **Do not push to `main` and do not merge your own PR** without explicit human
  confirmation. Leave the branch ready for review.

## Worktree isolation (parallel agents)

Each spec/task/agent works in its **own git worktree** — a branch alone isolates
history, not the physical checkout ([ADR-0016](docs/adr/0016-git-flow-branch-pr-worktree.md)).

```powershell
git switch main; git pull --ff-only
git worktree add .worktrees/spec-007-codex -b codex/spec-007 main
cd .worktrees/spec-007-codex
```

- Branch per task: `<engine>/spec-<id>` (e.g. `codex/spec-007`, `gemini/spec-008`).
- Start each agent inside its worktree, never in the shared root checkout.
- Dependent tasks are not parallelized without an explicit base branch — run them
  in sequence or rebase onto the dependency.
- Worktrees isolate branch / working tree / uncommitted files / in-folder build
  artifacts, but NOT credentials, global caches, dev-server ports, or external
  resources. When running a dev server or smoke test, use your own temporary port.
- Cleanup after integrating or discarding: `git worktree remove .worktrees/<f>`,
  `git branch -d <engine>/spec-<id>`, `git worktree prune`. If the harness created
  the worktree, the harness cleans it up.

The [orchestration layer](orchestration/README.md) automates this: `dispatch.ps1`
(one spec → one worktree), `swarm.ps1` (many in parallel), `gate.ps1` (the merge
filter), `monitor.ps1` (status).

## Product non-negotiables (machine-enforced)

- **No match score, ranking, or hire/reject verdict** anywhere — no field named
  `score`/`rating`/`fit`/`percentage`, no numeric fit value
  ([ADR-0002](docs/adr/0002-evidence-first-no-final-score.md)). Conservative,
  uncertainty-preserving language. Missing public evidence is an interview-
  validation item, never a gap.
- The **forbidden-vocabulary list has one source** (`backend/internal/eval/forbidden_vocabulary.txt`).
- The **data contracts, mock pipeline, and policy validator are frozen** — do not
  modify them unless your spec explicitly owns them.
- **Implement only your spec's partition paths.** Tests run fully offline — no
  live model/GitHub/cloud calls in the default suite.
- **Don't implement a unit before its spec is `Ready`** ([specs/](specs/README.md)).
