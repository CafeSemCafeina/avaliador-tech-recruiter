<#
.SYNOPSIS
  Mirror .claude/skills -> .agents/skills so non-Claude engines (codex, agy) see
  the same project skills.

.DESCRIPTION
  .claude/skills is the single source of truth. .agents/ is a generated mirror
  (gitignored), not versioned — run this after changing any project skill so the
  engine-agnostic copy stays in sync (no drift). Claude Code reads .claude/skills
  directly; Codex/Antigravity read the .agents/skills mirror.

.EXAMPLE
  pwsh orchestration/sync-agent-skills.ps1
#>
$ErrorActionPreference = "Stop"
$repo = (& git rev-parse --show-toplevel).Trim()
$src = Join-Path $repo ".claude/skills"
$dst = Join-Path $repo ".agents/skills"

if (-not (Test-Path $src)) { Write-Error "no .claude/skills at $src"; exit 1 }

Remove-Item -Recurse -Force $dst -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item -Recurse -Force "$src/*" $dst

$n = (Get-ChildItem $dst -Directory -ErrorAction SilentlyContinue).Count
Write-Host "synced $n skill(s) from .claude/skills -> .agents/skills" -ForegroundColor Green
