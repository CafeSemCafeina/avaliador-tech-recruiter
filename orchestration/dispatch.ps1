<#
.SYNOPSIS
  Dispatch one Ready spec to a specialist agent in an isolated git worktree
  (the hybrid orchestrator+specialist model, ADR-0013 / ADR-0015).

.DESCRIPTION
  Resolves the spec, picks the engine (from -Engine or the spec's "Owner engine"),
  creates a worktree on a dedicated branch, assembles a self-contained prompt
  (orchestration/prompt-template.md + the spec) into <worktree>/.agent-task.md,
  and — with -Run — invokes the engine non-interactively. With -Gate it runs the
  eval gates (the merge filter) on the worktree afterward. Without -Run it is a
  dry run: it sets up the worktree and prompt but does not call the engine.

  Engines: codex (tested, headless), agy/gemini (need auth — see README).

.EXAMPLE
  pwsh orchestration/dispatch.ps1 -Spec 007                      # dry run
  pwsh orchestration/dispatch.ps1 -Spec 007 -Engine codex -Run -Gate
#>
param(
  [Parameter(Mandatory)][string]$Spec,
  [ValidateSet("codex", "agy", "gemini")][string]$Engine,
  [switch]$Run,
  [switch]$Gate,
  [string]$WorktreeRoot
)
$ErrorActionPreference = "Stop"

$repo = (& git rev-parse --show-toplevel).Trim()
$specFile = Get-ChildItem "$repo/specs" -Filter "$Spec*.md" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $specFile -and $Spec -match '^\d+$') {
  # Resolve a numeric id regardless of zero-padding (5 / 05 / 005 -> 005-*.md).
  $n = [int]$Spec
  $specFile = Get-ChildItem "$repo/specs" -Filter "*.md" -ErrorAction SilentlyContinue |
  Where-Object { $_.BaseName -match "^0*$n-" } | Select-Object -First 1
}
if (-not $specFile) { throw "spec '$Spec' not found under specs/" }
$specId = ($specFile.BaseName -split '-')[0]
$specText = Get-Content $specFile.FullName -Raw

# A spec must be Ready (or further) before implementation (spec-driven-workflow).
if ($specText -notmatch "(?m)^\s*-\s*\*\*Status:\*\*\s*(Ready|In progress|Implemented)") {
  Write-Warning "Spec $specId is not marked Ready. Per the workflow, do not implement a Draft spec — promote it first."
}

# Engine: explicit flag wins; otherwise infer from the spec's Owner engine line.
if (-not $Engine) {
  $owner = ""
  if ($specText -match "Owner engine:\*\*\s*(.+)") { $owner = $Matches[1].ToLower() }
  $Engine = if ($owner -match "codex") { "codex" }
  elseif ($owner -match "gemini") { "gemini" }
  elseif ($owner -match "agy|antigravity") { "agy" }
  else { "codex" }
  Write-Host "auto-selected engine '$Engine' from owner: $owner" -ForegroundColor DarkGray
}

$wtRoot = if ($WorktreeRoot) { $WorktreeRoot } else { Join-Path (Split-Path $repo -Parent) "atr-worktrees" }
New-Item -ItemType Directory -Force $wtRoot | Out-Null
$branch = "feat/spec-$specId-$Engine"
$wt = Join-Path $wtRoot "spec-$specId-$Engine"

if (-not (Test-Path $wt)) {
  Write-Host "creating worktree $wt on branch $branch" -ForegroundColor Cyan
  try { & git -C $repo worktree add -b $branch $wt | Out-Host }
  catch { & git -C $repo worktree add $wt $branch | Out-Host } # branch already exists
}
else { Write-Host "reusing existing worktree $wt" -ForegroundColor DarkGray }

# Assemble the self-contained work order.
$template = Get-Content "$repo/orchestration/prompt-template.md" -Raw
$task = Join-Path $wt ".agent-task.md"
($template + "`n" + $specText) | Set-Content $task -Encoding utf8
Write-Host "work order: $task ($((Get-Item $task).Length) bytes)"

if ($Run) {
  Write-Host "`ninvoking $Engine ..." -ForegroundColor Green
  switch ($Engine) {
    "codex" { Get-Content $task -Raw | codex exec -s workspace-write -C $wt - }
    "agy" { Push-Location $wt; try { agy --print (Get-Content $task -Raw) --dangerously-skip-permissions --add-dir $wt } finally { Pop-Location } }
    "gemini" { Push-Location $wt; try { gemini -p (Get-Content $task -Raw) } finally { Pop-Location } }
  }
}
else {
  Write-Host "`nDRY RUN — engine not invoked. Re-run with -Run (and -Gate) to execute." -ForegroundColor Yellow
}

if ($Gate) { & "$repo/orchestration/gate.ps1" -Root $wt }

Write-Host "`nReview & merge when the gates are green:" -ForegroundColor Cyan
Write-Host "  pwsh orchestration/gate.ps1 -Root `"$wt`""
Write-Host "  git -C `"$repo`" merge --no-ff $branch     # or open a PR from $branch"
Write-Host "  git -C `"$repo`" worktree remove `"$wt`""

# Structured result (last pipeline output) so swarm.ps1 can consume it. Write-Host
# above goes to the host, not the pipeline, so this is the only returned object.
[pscustomobject]@{ Spec = $specId; Engine = $Engine; Branch = $branch; Worktree = $wt; Task = $task }
