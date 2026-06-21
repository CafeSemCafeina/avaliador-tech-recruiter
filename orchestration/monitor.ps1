<#
.SYNOPSIS
  Live status of a running swarm (ADR-0015). Reads the state written by swarm.ps1.

.DESCRIPTION
  For each agent: shows whether its process is still running, and once exited,
  classifies the worktree as GREEN / RED (from the gate marker in its log) so the
  orchestrator knows which worktrees are mergeable. -Watch refreshes until all
  agents finish.

.EXAMPLE
  pwsh orchestration/monitor.ps1
  pwsh orchestration/monitor.ps1 -Watch
#>
param(
  [switch]$Watch,
  [int]$IntervalSec = 5
)

$repo = (& git rev-parse --show-toplevel).Trim()
$state = Join-Path $repo ".worktrees/.logs/swarm.json"
if (-not (Test-Path $state)) { Write-Host "no swarm state at $state — run swarm.ps1 first."; exit 1 }

function Get-AgentStatus($a) {
  $st = $a.Status
  if ($a.Pid) {
    if (Get-Process -Id $a.Pid -ErrorAction SilentlyContinue) {
      $st = "running"
    }
    else {
      $st = "exited"
      if (Test-Path $a.Log) {
        $c = Get-Content $a.Log -Raw
        if ($c -match "GATES: GREEN") { $st = "GREEN" }
        elseif ($c -match "GATES: RED") { $st = "RED" }
      }
    }
  }
  $last = ""
  if (Test-Path $a.Log) { $last = (Get-Content $a.Log -Tail 1 -ErrorAction SilentlyContinue) }
  [pscustomobject]@{ Spec = $a.Spec; Engine = $a.Engine; Pid = $a.Pid; Status = $st; Last = $last }
}

do {
  if ($Watch) { Clear-Host }
  $agents = Get-Content $state -Raw | ConvertFrom-Json
  Write-Host "swarm monitor — $(Get-Date -Format HH:mm:ss)" -ForegroundColor Cyan
  $rows = @($agents | ForEach-Object { Get-AgentStatus $_ })
  $rows | Format-Table Spec, Engine, Pid, Status, Last -AutoSize -Wrap
  $running = @($rows | Where-Object { $_.Status -eq "running" }).Count
  $green = @($rows | Where-Object { $_.Status -eq "GREEN" }).Count
  Write-Host "running=$running  green=$green  total=$($rows.Count)"
  if ($Watch -and $running -gt 0) { Start-Sleep -Seconds $IntervalSec } else { break }
} while ($true)
