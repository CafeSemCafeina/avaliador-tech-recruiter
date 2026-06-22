# ADR 0007 - Deploy frontend on AWS Amplify and backend as a container

Status: Accepted  
Date: 2026-06-20

## Context

The project should demonstrate basic AWS literacy without turning a one-week MVP into a DevOps project.

The frontend is a React/Vite app. The backend is a Go API that may need document parsing dependencies and an agent pipeline. These have different hosting needs.

## Decision

Deploy the frontend on AWS Amplify and the backend as a container through AWS ECS Express Mode when available.

Planned cloud components:

- Amplify for React + TypeScript + Vite frontend hosting;
- ECR for backend Docker image;
- ECS Express Mode for backend container;
- CloudWatch for logs;
- S3 optional for uploads/exports in a later phase.

## Alternatives considered

### Host everything on Amplify

Rejected. Amplify is a good frontend path, but not the natural place for a persistent Go API with document parsing.

### Use EC2 as a VPS

Rejected for the MVP. It is flexible and useful for learning, but requires more server administration, SSH, reverse proxy, TLS, updates, and process management.

### Use Render for all backend hosting

Rejected as primary path. It is simpler, but the project should demonstrate AWS. It remains a fallback if AWS setup blocks progress.

### Use ECS Express Mode for backend container

Accepted. It is closer to a managed container platform and shows container/cloud deployment without managing a VM.

## Consequences

Positive:

- clear cloud story;
- frontend and backend can be deployed independently;
- backend remains portable as a Docker image;
- CloudWatch logs demonstrate operational awareness.

Negative:

- ECS/ECR setup adds complexity;
- costs must be controlled with budgets and cleanup;
- stateless backend design is required.

## Validation

The backend must expose `/health`, run in Docker locally, and be deployable from an image. The frontend must use `VITE_API_BASE_URL` to call the backend. If ECS blocks progress, the fallback must be documented.

## Implementation

Dockerization landed in `backend/Dockerfile` (multi-stage, static binary on `distroless/static`, ~28 MB) and `frontend/Dockerfile` (Vite build → nginx; built from the repo root so it can reach `design/`). `docker-compose.yml` runs both locally for a smoke test, and [`scripts/push-backend.ps1`](../../scripts/push-backend.ps1) builds and pushes the backend image to ECR. The Amplify build spec is [`amplify.yml`](../../amplify.yml). The full runbook is [docs/DEPLOY.md](../DEPLOY.md).

Compute deviation: the backend was deployed on **AWS App Runner** (from the ECR image), not ECS Express Mode. App Runner serves the same intent — a managed container with a public HTTPS URL and no VM to administer — with far less setup (no VPC/cluster/task-def/ALB wiring) and a stable URL. ECS Express/Fargate remain documented alternatives in [docs/DEPLOY.md](../DEPLOY.md). The frontend went out via an Amplify **manual deploy** (CLI zip upload) rather than a GitHub connection, so it needed no console OAuth; the git-connected path stays available via `amplify.yml`.

Vertex-from-AWS detail: Vertex normally authenticates via an ADC service-account **file**, but ECS Fargate injects secrets as **environment variables** and the backend image is distroless (no shell to materialize the secret as a file). So the `LLMClient` ([ADR-0011](0011-use-gemini-and-spike-google-adk.md)) now accepts the key as JSON *content* via `GOOGLE_CREDENTIALS_JSON` and builds the Vertex credentials from it (`cloud.google.com/go/auth/credentials.DetectDefault`); empty falls back to ADC so the local `gcloud` flow is unchanged. The key is stored in AWS Secrets Manager and injected as that env var — no key file, no API-key fallback needed.

