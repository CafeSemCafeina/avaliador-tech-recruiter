# Orchestration layer

Tooling for the **hybrid orchestrator + specialist** workflow ([ADR-0013](../docs/adr/0013-hybrid-orchestrator-specialist-agent-workflow.md), [ADR-0015](../docs/adr/0015-agent-orchestration-tooling.md)): a precise orchestrator owns the contracts, the `LLMClient`/eval seam, and merges; specialist agents fan out on partitioned packages in isolated git worktrees, gated by the eval suite.

A spec is the unit of partition and the work order. The **eval gates — not eyeballing — are the merge filter**: a worktree is mergeable only when [`gate.ps1`](gate.ps1) is green.

## Pieces

| File | Role |
|---|---|
| [`dispatch.ps1`](dispatch.ps1) | Hand one Ready spec to an engine in its own worktree + branch. |
| [`swarm.ps1`](swarm.ps1) | Run several specs in parallel — one background agent + worktree + log each. |
| [`monitor.ps1`](monitor.ps1) | Live status of a running swarm (running / GREEN / RED per agent). |
| [`gate.ps1`](gate.ps1) | Run the eval gates (backend gofmt/vet/test + frontend typecheck/test/build). Exit 0 = mergeable. The merge filter. |
| [`prompt-template.md`](prompt-template.md) | Guardrail preamble prepended to every spec (non-negotiables, scope discipline, git discipline). |
| [`sync-agent-skills.ps1`](sync-agent-skills.ps1) | Mirror `.claude/skills` → `.agents/skills` (gitignored) so Codex/agy see the same project skills. Run after changing a skill. |

## Engines (terminal-drivable, verified 2026-06-21)

| Engine | Non-interactive call | Status |
|---|---|---|
| **codex** | `codex exec -s workspace-write -C <dir> -` (prompt on stdin) | ✅ Works headless, authenticated (gpt-5.5). The tested path. |
| **gemini** | `gemini -p "<prompt>"` | ⚠️ Needs auth — hangs without `GEMINI_API_KEY` or a completed `gemini` login. |
| **agy** (Antigravity) | `agy --print "<prompt>" --add-dir <dir> --dangerously-skip-permissions` | ⚠️ Runs but returned empty in the smoke; needs auth/invocation tuning. |

Get gemini/agy into the swarm by authenticating their CLIs once, then they work the same way.

## Usage

```powershell
# Dry run: set up the worktree + assemble the work order, do not call the engine.
pwsh orchestration/dispatch.ps1 -Spec 007

# Real run: dispatch to codex and gate the result.
pwsh orchestration/dispatch.ps1 -Spec 007 -Engine codex -Run -Gate
```

`dispatch.ps1` infers the engine from the spec's **Owner engine** line when `-Engine` is omitted. It refuses-with-warning to treat a `Draft` spec as implementable. Worktrees live in `.worktrees/spec-<id>-<engine>` on `<engine>/spec-<id>` branches (gitignored; ADR-0016).

### Parallel swarm

```powershell
# Fan out several specs at once (one background agent + worktree + log each):
pwsh orchestration/swarm.ps1 -Specs 007,008,009

# Watch them: shows running / GREEN / RED per agent until all finish.
pwsh orchestration/monitor.ps1 -Watch
```

`swarm.ps1` sets up each worktree sequentially (avoids git-worktree lock races) then launches the engine runs in parallel as background processes, writing `.worktrees/.logs/spec-<id>-<engine>.log` and a `swarm.json` state file that `monitor.ps1` reads. Each agent runs its own `gate.ps1` (unless `-NoGate`); the orchestrator merges only the GREEN worktrees. `-DryRun` sets up worktrees and the plan without launching.

This is the native-Windows alternative to tmux: real parallelism, persistent logs, and non-blocking monitoring without a Unix layer. (Interactive engines like gemini/agy must be authenticated to run headless; the swarm does not fake a TTY.)

## The loop

1. Spec is `Ready` (see [`specs/`](../specs/README.md)).
2. `dispatch.ps1 -Spec <id> -Run` → specialist implements in its worktree, commits atomically, **does not push or merge**.
3. `gate.ps1 -Root <worktree>` green → orchestrator reviews the diff and merges (`--no-ff` or a PR), then `git worktree remove`.
4. Red gate → the imprecision costs a retry, not a shipped defect. Re-dispatch or fix.

Pushing to `main` still requires explicit human confirmation — the orchestrator never auto-pushes.
