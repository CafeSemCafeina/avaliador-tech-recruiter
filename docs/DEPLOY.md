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
            ECS task (backend container :8080) ──► Gemini on Vertex AI
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

## 2. The Vertex credential as a secret

`ANALYSIS_MODE=gemini` runs on **Vertex AI**
([ADR-0011](adr/0011-use-gemini-and-spike-google-adk.md)). The AWS demo uses
Vertex express mode: a Google Cloud API key bound to a dedicated service
account with `roles/aiplatform.user` and restricted to
`aiplatform.googleapis.com`. Store the key in AWS Secrets Manager as
`avaliador/vertex-api-key` and inject it as `GOOGLE_API_KEY`.

Runtime env: `ANALYSIS_MODE=gemini`, `GOOGLE_GENAI_USE_VERTEXAI=true`,
`GEMINI_MODEL_FAST=gemini-3.5-flash`,
`GEMINI_MODEL_STRONG=gemini-3.1-pro-preview`, and `GOOGLE_API_KEY` sourced from
the secret above. Omit `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` in
express mode because the SDK treats API-key and project/location initialization
as mutually exclusive.

Local development still defaults to ADC with
`gcloud auth application-default login`. `GOOGLE_CREDENTIALS_JSON` remains an
optional compatibility path, but Workload Identity Federation is preferred to
either long-lived secret for production.

## 3. Run the backend

### Option A — AWS App Runner (used in this deploy)

App Runner runs the container straight from the ECR image and hands back a
stable public HTTPS URL, with TLS, autoscaling, and `/health` checks managed
for it. This is the path that was actually deployed (ADR-0007 records the
deviation from ECS).

```powershell
# 1. One-time IAM role so App Runner can pull from private ECR.
aws iam create-role --role-name AppRunnerECRAccessRole `
  --assume-role-policy-document file://apprunner-trust.json   # trusts build.apprunner.amazonaws.com
aws iam attach-role-policy --role-name AppRunnerECRAccessRole `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

# 2. Create the service (see scripts/apprunner-create.json for the full input).
aws apprunner create-service --cli-input-json file://apprunner-create.json --region us-east-1
```

Key fields in the service config: `ImageConfiguration.Port = 8080`,
`RuntimeEnvironmentVariables` (`ANALYSIS_MODE`, `PORT`, and the gemini vars from
§2), `HealthCheckConfiguration.Path = /health`. For `ANALYSIS_MODE=gemini`,
inject `GOOGLE_API_KEY` via `RuntimeEnvironmentSecrets` pointing at the Secrets
Manager secret, and give the service an **instance role**
(`InstanceConfiguration.InstanceRoleArn`) with `secretsmanager:GetSecretValue`.

Poll `describe-service` until `Status = RUNNING`, then `curl https://<ServiceUrl>/health`.

### Option B — ECS Express Mode (ADR-0007 original)

If you prefer ECS, point Express Mode at the pushed ECR image and set the same
environment variables. It provisions the cluster, service, networking, and a
public URL. Set `/health` as the health check path.

### Option C — Fargate service (portable fallback)

Create a CloudWatch log group, an ECS cluster, register a task definition, and
run a service behind a public IP or ALB. Minimum task-definition essentials:

- **image**: `…dkr.ecr.us-east-1.amazonaws.com/avaliador-backend:latest`
- **portMappings**: container port `8080`
- **logConfiguration**: `awslogs` driver → log group `/ecs/avaliador-backend`
- **environment**:
  - `ANALYSIS_MODE=gemini`
  - `PORT=8080`
  - `GOOGLE_GENAI_USE_VERTEXAI=true`
  - `GEMINI_MODEL_FAST=gemini-3.5-flash`
  - `GEMINI_MODEL_STRONG=gemini-3.1-pro-preview`
- **secrets** (injected from Secrets Manager):
  - `GOOGLE_API_KEY` → `avaliador/vertex-api-key` (the Vertex key, §2)
  - `GITHUB_TOKEN` → optional, raises GitHub API rate limits

The task's execution role needs `secretsmanager:GetSecretValue` for those ARNs
and the standard `AmazonECSTaskExecutionRolePolicy` for ECR + CloudWatch.

Confirm it's up:

```bash
curl http://<ecs-public-host>:8080/health   # {"status":"ok"}
```

Note the backend's public URL — the frontend needs it next.

## 4. Deploy the frontend on Amplify

Two ways. The **manual deploy** below is what this project used — it needs no
GitHub OAuth and is fully CLI-scriptable.

### Manual deploy (used)

```powershell
# Build locally with the backend URL baked in (Vite inlines it).
$env:VITE_API_BASE_URL = "https://<app-runner-service-url>"
cd frontend; npm run build

$appId = (aws amplify create-app --name avaliador-frontend --query app.appId --output text)
aws amplify create-branch --app-id $appId --branch-name main
$dep = aws amplify create-deployment --app-id $appId --branch-name main | ConvertFrom-Json
Compress-Archive -Path frontend/dist/* -DestinationPath dist.zip -Force
Invoke-WebRequest -Uri $dep.zipUploadUrl -Method Put -InFile dist.zip -ContentType application/zip
aws amplify start-deployment --app-id $appId --branch-name main --job-id $dep.jobId
# Live at https://main.$appId.amplifyapp.com
```

Rebuild + redeploy whenever the backend URL changes (the URL is compiled in).

### Git-connected deploy (CI on push)

Alternatively, Amplify console → **New app → Host web app** → connect this
GitHub repo; it auto-detects [`amplify.yml`](../amplify.yml) (appRoot
`frontend`). Set `VITE_API_BASE_URL` under App settings → Environment variables
**before** the build. This gives auto-deploy on every push.

> CORS: the backend already sends `Access-Control-Allow-Origin: *`
> (`backend/internal/api/server.go`), so the Amplify origin can call it directly.

## 5. Logs & observability

Backend logs (request lifecycle, `listening on :8080 (ANALYSIS_MODE=…)`) go to
the CloudWatch log group configured on the task. Amplify build/deploy logs live
in the Amplify console.

## 6. Cost control & cleanup

- Create an **AWS Budgets** alert before leaving anything running.
- App Runner bills while the service exists (even idle). Pause or delete it when
  not in use:
  ```bash
  aws apprunner pause-service  --service-arn <arn> --region us-east-1
  aws apprunner delete-service --service-arn <arn> --region us-east-1
  ```
- Tear down the rest when idle: delete the Amplify app, old ECR images (or set an
  ECR lifecycle policy), and any Secrets Manager secrets. If you used ECS instead,
  delete the service/cluster and ALB.

## 7. Fallback

If ECS/ECR blocks progress, ADR-0007 allows **Render** as the backend fallback:
deploy `backend/` as a Docker web service with the same environment variables,
and keep the frontend on Amplify pointed at the Render URL. Document the switch
in the ADR if you take it.
