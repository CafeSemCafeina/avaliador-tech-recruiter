#requires -version 7
<#
.SYNOPSIS
  Build the backend Docker image and push it to Amazon ECR.

.DESCRIPTION
  Implements the "build + push" half of ADR-0007. Requires the AWS CLI v2
  (configured with credentials) and Docker. Creates the ECR repository on first
  run. Run from the repo root.

.EXAMPLE
  ./scripts/push-backend.ps1 -Region us-east-1
  ./scripts/push-backend.ps1 -Region us-east-1 -Repo avaliador-backend -Tag v1
#>
param(
  [string]$Region = "us-east-1",
  [string]$Repo   = "avaliador-backend",
  [string]$Tag    = "latest"
)

$ErrorActionPreference = "Stop"

# Helper: fail fast when the previous native command returned non-zero.
# (PowerShell try/catch does NOT catch native exit codes, so check explicitly.)
function Assert-LastExit($msg) { if ($LASTEXITCODE -ne 0) { throw $msg } }

$accountId = (aws sts get-caller-identity --query Account --output text).Trim()
Assert-LastExit "Could not resolve AWS account id. Is the AWS CLI configured?"

$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"
$imageUri = "$registry/$Repo`:$Tag"
Write-Host "Target image: $imageUri" -ForegroundColor Cyan

# Create the repository if it does not exist yet (idempotent). describe-repositories
# exits non-zero when the repo is missing; create only in that case.
aws ecr describe-repositories --repository-names $Repo --region $Region *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating ECR repository $Repo ..." -ForegroundColor Yellow
  aws ecr create-repository --repository-name $Repo --region $Region --image-scanning-configuration scanOnPush=true | Out-Null
  Assert-LastExit "Failed to create ECR repository $Repo."
}

# Authenticate Docker to ECR.
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry
Assert-LastExit "Docker login to ECR failed."

# Build for linux/amd64 (ECS Fargate) regardless of host arch, then push.
docker build --platform linux/amd64 -t $imageUri ./backend
Assert-LastExit "Docker build failed."
docker push $imageUri
Assert-LastExit "Docker push failed."

Write-Host "`nPushed $imageUri" -ForegroundColor Green
Write-Host "Use this URI as the container image in your ECS task definition." -ForegroundColor Green
