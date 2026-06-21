<#
.SYNOPSIS
  Runs the evaluation gates (the merge filter, EVALUATION.md / ADR-0013).

.DESCRIPTION
  Backend: gofmt (must be empty), go vet, go test ./... (L0/L1/L2 + offline
  Gemini tests). Frontend: typecheck, vitest, build. Exit 0 = GREEN (mergeable),
  exit 1 = RED. Live model/GitHub/cloud calls never run here. Point -Root at a
  worktree to gate a specialist's work in isolation.

.EXAMPLE
  pwsh orchestration/gate.ps1
  pwsh orchestration/gate.ps1 -Root C:\path\to\worktree
#>
param(
  [string]$Root = (& git rev-parse --show-toplevel 2>$null)
)

if (-not $Root) { $Root = (Resolve-Path "$PSScriptRoot/..").Path }

# Ensure Go is on PATH (winget installs to Program Files).
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  $goBin = "C:\Program Files\Go\bin"
  if (Test-Path "$goBin\go.exe") { $env:Path = "$goBin;$env:Path" }
}

$fail = 0
function step($label, [scriptblock]$body) {
  Write-Host "`n--- $label ---" -ForegroundColor Cyan
  & $body
}

step "backend: gofmt" {
  Push-Location "$Root/backend"
  $bad = gofmt -l .
  Pop-Location
  if ($bad) { Write-Host "gofmt needed on:`n$bad" -ForegroundColor Red; $script:fail = 1 }
  else { Write-Host "clean" }
}
step "backend: go vet" {
  Push-Location "$Root/backend"; go vet ./...; if ($LASTEXITCODE -ne 0) { $script:fail = 1 }; Pop-Location
}
step "backend: go test (L0/L1/L2 + offline gemini)" {
  Push-Location "$Root/backend"; go test ./...; if ($LASTEXITCODE -ne 0) { $script:fail = 1 }; Pop-Location
}

if (Test-Path "$Root/frontend/package.json") {
  step "frontend: typecheck" {
    Push-Location "$Root/frontend"; npm run typecheck; if ($LASTEXITCODE -ne 0) { $script:fail = 1 }; Pop-Location
  }
  step "frontend: test" {
    Push-Location "$Root/frontend"; npm test; if ($LASTEXITCODE -ne 0) { $script:fail = 1 }; Pop-Location
  }
  step "frontend: build" {
    Push-Location "$Root/frontend"; npm run build; if ($LASTEXITCODE -ne 0) { $script:fail = 1 }; Pop-Location
  }
}

if ($fail) { Write-Host "`nGATES: RED" -ForegroundColor Red; exit 1 }
Write-Host "`nGATES: GREEN" -ForegroundColor Green
exit 0
