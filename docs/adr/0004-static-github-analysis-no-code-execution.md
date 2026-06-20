# ADR 0004 - Use static GitHub analysis instead of executing candidate code

Status: Accepted  
Date: 2026-06-20

## Context

GitHub repositories can provide strong technical evidence: languages, project structure, README quality, tests, Dockerfiles, backend/frontend boundaries, and implementation depth.

Running arbitrary public code is a different problem. It introduces security, timeout, dependency, and infrastructure risks that do not fit the first MVP.

## Decision

Use static GitHub analysis for the MVP.

The analyzer may inspect:

- public non-empty repositories;
- repository metadata;
- language breakdown;
- README files;
- `package.json`;
- `go.mod`;
- `requirements.txt`;
- `pyproject.toml`;
- `Dockerfile`;
- folder structure;
- test and CI indicators;
- deployment hints.

The analyzer must not:

- execute candidate code;
- install dependencies;
- run repository test suites;
- run scripts from cloned repositories;
- treat missing public repos as proof of lack of skill.

## Alternatives considered

### Clone and execute every repository

Rejected. It is too risky for the MVP and requires a proper sandbox.

### Ignore GitHub and rely only on resume/LinkedIn

Rejected. GitHub is one of the most useful public signals for technical maturity.

### Static analysis first, sandbox later

Accepted. It provides meaningful evidence while keeping the system safe and deliverable.

## Consequences

Positive:

- safer MVP;
- faster analysis;
- simpler deployment;
- easier to explain limitations.

Negative:

- cannot prove that code builds or tests pass;
- may miss private/professional work not visible on GitHub.

## Validation

The report must distinguish "not publicly evidenced" from "does not know". Future sandbox execution should require container isolation, no secrets, resource limits, timeouts, and no privileged access.

