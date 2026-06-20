# ADR 0010 - Prefer project skills and agent rubrics before MCP

Status: Accepted  
Date: 2026-06-20

## Context

An MCP server could be useful later, but building one in the MVP would add protocol, transport, schema, and integration overhead. The project already needs a backend, frontend, agent pipeline, document parsing, static analysis, tests, CI, and deploy.

There is a simpler way to show AI-native workflow: create project-specific coding skills and internal agent rubrics that guide development and analysis.

## Decision

For the MVP, prioritize:

- repository skills for coding agents;
- internal rubrics for Eino/agent prompts;
- clear agent policies.

Planned files:

- `.claude/skills/tech-maturity-project/SKILL.md`;
- `.claude/skills/evidence-matrix-analyst/SKILL.md`;
- `.claude/skills/aws-ecs-express-deploy/SKILL.md`;
- `backend/internal/agents/rubrics/evidence_policy.md`;
- `backend/internal/agents/rubrics/seniority.md`;
- `backend/internal/agents/rubrics/star_method.md`;
- `backend/internal/agents/rubrics/stack_taxonomy.json`.

MCP can be revisited after the core workflow works.

## Alternatives considered

### Build an MCP server immediately

Rejected. It is interesting but not required for the first useful product, and it competes with core delivery time.

### Use no explicit skills or rubrics

Rejected. The product depends on consistent analysis behavior, so agent instructions should be reusable and versioned.

### Add skills and rubrics first, MCP later

Accepted. It improves both development workflow and product quality with lower scope risk.

## Consequences

Positive:

- faster than MCP;
- documents AI-assisted development process;
- improves agent consistency;
- easy to review in GitHub.

Negative:

- does not expose a formal MCP interface in the MVP;
- some integrations remain manual or internal.

## Validation

Skills and rubrics should be referenced by README or implementation docs. If MCP is added later, it should wrap stable report/query capabilities rather than shape the initial architecture.

