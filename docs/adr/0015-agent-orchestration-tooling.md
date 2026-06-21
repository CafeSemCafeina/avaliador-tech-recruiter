# ADR 0015 - Agent orchestration tooling

Status: Accepted
Date: 2026-06-21

## Context

[ADR-0013](0013-hybrid-orchestrator-specialist-agent-workflow.md) chose a hybrid orchestrator + specialist workflow: an orchestrator owns contracts and merges; specialist agents implement partitioned specs in isolated worktrees, gated by the eval suite. Tier 1 and Tier 2 were built mostly inline; to actually fan work out we need concrete tooling to launch specialist agents and gate their output.

A capability test (2026-06-21) checked which agent CLIs on the dev machine can run **non-interactively** from the terminal:

- **`codex exec`** (OpenAI Codex CLI): works headless and authenticated (gpt-5.5), supports `-s workspace-write`, `-C <dir>`, prompt via stdin. ✅
- **`gemini -p`** (Google Gemini CLI): hangs without auth (`GEMINI_API_KEY` / login). ⚠️
- **`agy --print`** (Antigravity CLI): runs but returned empty in the smoke; supports `--add-dir`, `--dangerously-skip-permissions`. ⚠️

## Decision

Add a small PowerShell orchestration layer under `orchestration/` that realizes ADR-0013:

- `dispatch.ps1` — given a `Ready` spec, create a git worktree on a dedicated branch, assemble a self-contained work order (`prompt-template.md` guardrails + the spec) and invoke the chosen engine non-interactively. Engine inferred from the spec's **Owner engine** when not given.
- `gate.ps1` — run the eval gates (backend `gofmt`/`vet`/`test`, frontend `typecheck`/`test`/`build`) against a worktree. Exit 0 = mergeable. This is the merge filter.
- `prompt-template.md` — the non-negotiables (no-score policy, frozen contracts, scope discipline, atomic commits, do-not-push) prepended to every dispatch.

Engines are pluggable; **Codex is the tested default**. Gemini and agy are supported in the tooling but require their CLIs to be authenticated before use. Specialists commit atomically and never push/merge; the orchestrator (human + Claude) reviews and merges, and pushing to `main` still requires explicit confirmation.

## Alternatives considered

- **Claude subagents (Agent tool) only** — viable for Claude-driven fan-out, but the goal is a multi-engine swarm (Codex/Gemini/Antigravity) per ADR-0013; the terminal-dispatch layer is engine-agnostic.
- **A CI-driven dispatcher** — premature; live agent runs are local and interactive-ish, and must stay out of the default CI suite (ADR-0009).
- **Bash scripts** — the dev machine is Windows/PowerShell-first; a bash port can be added for Linux/CI later.

## Consequences

Positive: specs become executable work orders; the eval gate is the mechanical merge filter, so imprecision costs a retry, not a shipped defect; worktrees keep specialists conflict-free.

Negative: PowerShell-only for now; gemini/agy need auth before they contribute; the orchestration scripts themselves are not yet covered by automated tests (validated by dry-run + a live gate run).

## Validation

`gate.ps1` runs green on the current tree; `dispatch.ps1` dry-run assembles a worktree + work order for an existing spec; `codex exec` returns output headlessly. A full live dispatch (Codex implementing a fresh spec end to end) is the next exercise, beginning with the Tier 3 GitHub-lite spec.
