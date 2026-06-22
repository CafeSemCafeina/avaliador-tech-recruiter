# Contributing

> [!WARNING]
> **Not Accepting Contributions**
> 
> This repository is a personal portfolio project and is **not accepting external contributions at this time**. The workflow documented below is intended solely for the author and autonomous AI agents operating within the repository.

This repo is built mostly by AI agents under a precise git flow. The same rules
apply to humans. Agent-specific behavior is in [AGENTS.md](AGENTS.md) (and
[CLAUDE.md](CLAUDE.md) for Claude Code); this file is the canonical workflow.

## Git flow and pull requests

The unit of a pull request is **one cohesive, mergeable logical change** — the
criterion is cohesion, not size. If a change can be reviewed and merged on its
own, it is its own PR, even a one-line typo.

- **Never commit directly to `main`. Always `branch → PR`**, including trivial changes.
- One branch per subject, with a type prefix: `docs/…`, `fix/…`, `feat/…`, `chore/…`, `refactor/…`.
- Don't mix subjects in one PR. Separate fix, refactor, and feature.
- A large PR is justified only when the change is indivisible (mechanical
  refactor, generated code, a feature that doesn't work half-built). The warning
  sign is "many subjects", not "many lines".
- [Conventional Commits](https://www.conventionalcommits.org/) with scopes
  (`feat(api): …`, `docs(adr): …`, `fix(ci): …`). Commit atomically.
- Fill the [PR template](.github/pull_request_template.md): summary, why,
  changes, how to test, risks.
- A change merges only when its eval gate is green (see [EVALUATION.md](docs/EVALUATION.md)
  / `orchestration/gate.ps1`). The gate — not eyeballing — is the merge filter.

### Repository automation

- **Delete branch on merge** is enabled on GitHub: the remote branch is removed
  automatically when the PR merges.
- Clean up local merged branches with the `git cleanup` alias (switches to
  `main`, prunes, deletes merged locals):

  ```sh
  git config --global alias.cleanup '!git checkout main && git fetch --prune && git branch --merged main | grep -vE "^[*+]| main$" | xargs -r git branch -d'
  ```

### Standard flow

```sh
git switch main && git pull --ff-only
git switch -c feat/spec-007-github-lite   # one branch = one subject
# edit, commit atomically with a type: feat/fix/docs/chore/refactor…
git push -u origin feat/spec-007-github-lite
gh pr create                              # open the PR even if it is small
# after merge: the remote branch is auto-deleted; run `git cleanup` for locals
```

For parallel agent work, each spec/task runs in its own **git worktree** under
`.worktrees/`, on a `<engine>/spec-<id>` branch
([ADR-0016](docs/adr/0016-git-flow-branch-pr-worktree.md)). See
[orchestration/README.md](orchestration/README.md).

## Product guardrails (non-negotiable)

This product never outputs a match score, ranking, or hire/reject verdict
([ADR-0002](docs/adr/0002-evidence-first-no-final-score.md)); it is
machine-enforced by the policy validator. Keep language conservative and
evidence-first. Don't modify the frozen contracts, mock pipeline, or policy
validator unless your spec owns them. Tests run fully offline — no live
model/GitHub/cloud calls in the default suite.

## Communication

Direct and technical, no marketing overstatement. The repo's docs are in
English; keep new docs and commits in English for consistency.
