# ADR 0009 - Keep the test and CI suite small but intentional

Status: Accepted  
Date: 2026-06-20

## Context

The project should show engineering maturity, but exhaustive testing is not realistic for a one-week MVP. The highest-risk areas are deterministic domain logic, API contracts, frontend workflow, and accidental breakage in builds.

## Decision

Use a small but deliberate test and CI suite.

Backend tests:

- stack normalization;
- quadrant classification;
- STAR question generation with mocks;
- HTTP handlers;
- GitHub static analysis with fixtures;
- LLM calls mocked.

Frontend tests:

- stack tag creation/removal;
- max three primary stacks;
- report rendering;
- API client with mocked fetch.

E2E:

- one Playwright happy path with mocked analysis output.

CI:

- Go fmt/vet/test/build;
- frontend lint/typecheck/test/build;
- Docker build;
- lightweight secret scanning;
- optional vulnerability checks if they do not block progress.

## Alternatives considered

### No tests until product works

Rejected. It weakens the work sample and makes refactoring risky.

### Full production-grade test suite

Rejected for MVP. It consumes too much time and creates false precision around LLM behavior.

### Minimal deterministic tests with mocked LLMs

Accepted. It protects the core behavior and keeps CI reliable.

## Consequences

Positive:

- demonstrates maturity;
- keeps LLM nondeterminism out of tests;
- catches regressions in the core flow.

Negative:

- not full coverage;
- live provider issues are not caught by unit tests.

## Validation

CI must be green before deploy. Tests must not call live AI providers, GitHub, LinkedIn, or cloud APIs by default.

