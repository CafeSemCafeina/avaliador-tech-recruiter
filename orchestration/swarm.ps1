<#
.SYNOPSIS
  Run several specialist agents in parallel (native Windows swarm, ADR-0015).

.DESCRIPTION
  For each spec: sets up its worktree + work order (sequentially, to avoid git
  worktree lock races), then launches the engine run in a background process,
  one log file per agent. Returns immediately; track progress with monitor.ps1.
  Each agent gates its own worktree (the merge filter) unless -NoGate.

  Specialists commit atomically and never push/merge — the orchestrator reviews
  and merges the green worktrees.

.EXAMPLE
  pwsh orchestration/swarm.ps1 -Specs 007,008
  pwsh orchestration/swarm.ps1 -Specs 007,008 -DryRun     # set up, don't launch
#>
param(
  [Parameter(Mandatory)][string[]]$Specs,
  [ValidateSet("codex", "agy", "gemini")][string]$Engine,
  [switch]$NoGate,
  [switch]$DryRun
)
$ErrorActionPreference = "Stop"

# Normalize: allow "-Specs 007,008" (one comma token) as well as 007,008 (array).
$Specs = @($Specs | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })

$repo = (& git rev-parse --show-toplevel).Trim()
$disp = Join-Path $repo "orchestration/dispatch.ps1"
$logDir = Join-Path $repo ".worktrees/.logs"
New-Item -ItemType Directory -Force $logDir | Out-Null

Write-Host "== swarm: setting up $($Specs.Count) worktree(s) ==" -ForegroundColor Cyan
$agents = @()
foreach ($s in $Specs) {
  $dargs = @{ Spec = $s }            # hashtable splat binds by name (no positional ambiguity)
  if ($Engine) { $dargs.Engine = $Engine }
  $info = & $disp @dargs # dry-run inside dispatch: worktree + work order only
  if (-not $info) { Write-Warning "setup failed for spec $s"; continue }
  $agents += [pscustomobject]@{
    Spec     = $info.Spec
    Engine   = $info.Engine
    Branch   = $info.Branch
    Worktree = $info.Worktree
    Log      = (Join-Path $logDir "spec-$($info.Spec)-$($info.Engine).log")
    Pid      = $null
    Status   = "planned"
  }
}

if (-not $DryRun) {
  Write-Host "`n== swarm: launching $($agents.Count) agent(s) in parallel ==" -ForegroundColor Cyan
  $gate = if ($NoGate) { '' } else { '-Gate' }
  foreach ($a in $agents) {
    $cmd = "& '$disp' -Spec $($a.Spec) -Engine $($a.Engine) -Run $gate *> '$($a.Log)'"
    $p = Start-Process pwsh -ArgumentList '-NoProfile', '-Command', $cmd -PassThru -WindowStyle Hidden
    $a.Pid = $p.Id
    $a.Status = "running"
    Write-Host "  spec $($a.Spec) [$($a.Engine)]  pid=$($p.Id)  -> $($a.Log)"
  }
}

$state = Join-Path $logDir "swarm.json"
$agents | ConvertTo-Json -Depth 5 | Set-Content $state -Encoding utf8

Write-Host "`nstate:   $state"
Write-Host "monitor: pwsh orchestration/monitor.ps1 -Watch"
if ($DryRun) { Write-Host "(DRY RUN — worktrees set up, no agents launched)" -ForegroundColor Yellow }
$agents | Format-Table Spec, Engine, Pid, Status, Branch -AutoSize
