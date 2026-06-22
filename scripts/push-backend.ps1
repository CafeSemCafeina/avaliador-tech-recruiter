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

$accountId = (aws sts get-caller-identity --query Account --output text).Trim()
if (-not $accountId) { throw "Could not resolve AWS account id. Is the AWS CLI configured?" }

$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"
$imageUri = "$registry/$Repo`:$Tag"
Write-Host "Target image: $imageUri" -ForegroundColor Cyan

# Create the repository if it does not exist yet (idempotent).
try { aws ecr describe-repositories --repository-names $Repo --region $Region | Out-Null }
catch {
  Write-Host "Creating ECR repository $Repo ..." -ForegroundColor Yellow
  aws ecr create-repository --repository-name $Repo --region $Region --image-scanning-configuration scanOnPush=true | Out-Null
}

# Authenticate Docker to ECR.
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry

# Build for linux/amd64 (ECS Fargate) regardless of host arch, then push.
docker build --platform linux/amd64 -t $imageUri ./backend
docker push $imageUri

Write-Host "`nPushed $imageUri" -ForegroundColor Green
Write-Host "Use this URI as the container image in your ECS task definition." -ForegroundColor Green
