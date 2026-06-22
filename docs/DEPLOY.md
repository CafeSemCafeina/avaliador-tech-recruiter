# Deployment guide (AWS)

This implements [ADR-0007](adr/0007-aws-amplify-and-container-backend.md):

- **Frontend** (React + Vite) → **AWS Amplify** (static hosting).
- **Backend** (Go API) → **Docker image** in **Amazon ECR** → **ECS** (Express
  Mode or Fargate service), logs in **CloudWatch**.
- The backend is stateless (in-memory store), so a single task is fine for the
  MVP and it scales horizontally only if you later add a shared store.

```
 Browser ──► Amplify (frontend, static)
                │  VITE_API_BASE_URL (baked at build)
                ▼
            ECS task (backend container :8080) ──► Gemini (Vertex AI / Dev API)
                │                                └► GitHub API (optional token)
                └► CloudWatch Logs
```

## 0. Prerequisites

- Docker (`docker --version`).
- AWS CLI v2 (`aws --version`) configured with credentials: `aws configure`
  (needs an IAM user/role with ECR, ECS, CloudWatch, IAM-passrole, and
  Secrets Manager permissions).
- An AWS account and a chosen region (examples below use `us-east-1`).
- A Gemini credential for `ANALYSIS_MODE=gemini` (see §3).

Verify the images build and run locally first:

```bash
docker compose up --build      # backend :8080, frontend :3000 (mock mode)
curl localhost:8080/health     # {"status":"ok"}
```

## 1. Build & push the backend image to ECR

A helper script does account lookup, repo creation, login, build, and push:

```powershell
./scripts/push-backend.ps1 -Region us-east-1
```

Equivalent manual steps:

```bash
AWS_REGION=us-east-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

aws ecr create-repository --repository-name avaliador-backend --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $REGISTRY
docker build --platform linux/amd64 -t $REGISTRY/avaliador-backend:latest ./backend
docker push $REGISTRY/avaliador-backend:latest
```

> Build with `--platform linux/amd64` — ECS Fargate runs amd64, and you may be
> building from an arm host.

## 2. The Gemini credential as a secret

`ANALYSIS_MODE=gemini` needs a credential. Two backends are supported
([ADR-0011](adr/0011-use-gemini-and-spike-google-adk.md)); pick one for AWS:

### Recommended for AWS — Gemini Developer API key

A single env var, easy to inject from Secrets Manager, no key files:

```bash
aws secretsmanager create-secret --name avaliador/google-api-key \
  --secret-string 'YOUR_GEMINI_API_KEY' --region us-east-1
```

Runtime env: `ANALYSIS_MODE=gemini`, `GOOGLE_GENAI_USE_VERTEXAI=false`, and
`GOOGLE_API_KEY` sourced from the secret above.

### Optional — Vertex AI from AWS

Vertex authenticates via Application Default Credentials, i.e. a GCP
service-account **JSON file** referenced by `GOOGLE_APPLICATION_CREDENTIALS`.
On Fargate + a distroless image there is no clean way to mount a secret as a
file, so Vertex-from-AWS requires extra work (a non-distroless image with an
entrypoint that writes the secret to disk, or GCP Workload Identity Federation).
Vertex stays the **local / GCP-hosted** path; for the AWS deploy prefer the API
key above. (The local Vertex flow is unchanged: `gcloud auth
application-default login` + `GOOGLE_GENAI_USE_VERTEXAI=true`.)

## 3. Run the backend on ECS

### Option A — ECS Express Mode (simplest, ADR-0007 primary)

If Express Mode is available in your region/console, point it at the pushed
ECR image and set the environment variables below. It provisions the cluster,
service, networking, and a public URL for you. Set `/health` as the health
check path.

### Option B — Fargate service (portable fallback)

Create a CloudWatch log group, an ECS cluster, register a task definition, and
run a service behind a public IP or ALB. Minimum task-definition essentials:

- **image**: `…dkr.ecr.us-east-1.amazonaws.com/avaliador-backend:latest`
- **portMappings**: container port `8080`
- **logConfiguration**: `awslogs` driver → log group `/ecs/avaliador-backend`
- **environment**:
  - `ANALYSIS_MODE=gemini`
  - `PORT=8080`
  - `GOOGLE_GENAI_USE_VERTEXAI=false`
  - `GEMINI_MODEL_FAST=gemini-3.5-flash`
  - `GEMINI_MODEL_STRONG=gemini-3.1-pro-preview`
- **secrets** (injected from Secrets Manager):
  - `GOOGLE_API_KEY` → `avaliador/google-api-key`
  - `GITHUB_TOKEN` → optional, raises GitHub API rate limits

The task's execution role needs `secretsmanager:GetSecretValue` for those ARNs
and the standard `AmazonECSTaskExecutionRolePolicy` for ECR + CloudWatch.

Confirm it's up:

```bash
curl http://<ecs-public-host>:8080/health   # {"status":"ok"}
```

Note the backend's public URL — the frontend needs it next.

## 4. Deploy the frontend on Amplify

1. Amplify console → **New app → Host web app** → connect this GitHub repo.
2. Amplify auto-detects [`amplify.yml`](../amplify.yml) (appRoot `frontend`).
3. App settings → **Environment variables** → add
   `VITE_API_BASE_URL = http://<ecs-public-host>:8080` (the backend URL from §3).
   Vite inlines this at build time, so set it **before** the build and redeploy
   on change.
4. Deploy. Amplify gives you the public frontend URL.

> CORS: the backend already sends `Access-Control-Allow-Origin: *`
> (`backend/internal/api/server.go`), so the Amplify origin can call it directly.

## 5. Logs & observability

Backend logs (request lifecycle, `listening on :8080 (ANALYSIS_MODE=…)`) go to
the CloudWatch log group configured on the task. Amplify build/deploy logs live
in the Amplify console.

## 6. Cost control & cleanup

- Create an **AWS Budgets** alert before leaving anything running.
- Tear down when idle: delete the ECS service/cluster, the ALB if used, the
  Amplify app, and old ECR images (or set an ECR lifecycle policy). Delete the
  Secrets Manager secrets.

## 7. Fallback

If ECS/ECR blocks progress, ADR-0007 allows **Render** as the backend fallback:
deploy `backend/` as a Docker web service with the same environment variables,
and keep the frontend on Amplify pointed at the Render URL. Document the switch
in the ADR if you take it.
