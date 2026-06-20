# ADR 0003 - Use a controlled Go-native agent pipeline

Status: Accepted  
Date: 2026-06-20

## Context

The product needs agentic analysis, but a free-form autonomous agent would be unreliable for a short MVP. Recruiting analysis also requires traceability: each conclusion should map back to evidence.

The backend is planned in Go, so the agent architecture should fit the backend rather than forcing the project into a Python-first stack.

## Decision

Use a controlled Go-native agent pipeline.

The planned pipeline:

1. `JobProfileAgent`
2. `ResumeEvidenceAgent`
3. `LinkedInEvidenceAgent`
4. `GitHubEvidenceAgent`
5. `PortfolioEvidenceAgent`
6. `EvidenceCheckerAgent`
7. `QuadrantClassifierAgent`
8. `STARQuestionAgent`
9. `TechnicalMaturityAnalystAgent`

Each agent should have:

- one responsibility;
- explicit input and output contracts;
- structured JSON output where practical;
- conservative prompts;
- minimal tool access.

## Alternatives considered

### Raw LLM API calls only

Rejected. It is faster initially, but does not demonstrate agentic design and makes the workflow harder to explain.

### Fully autonomous ReAct-style agent

Rejected for the MVP. It is more flexible but less predictable, harder to test, and riskier in a demo.

### Python-first frameworks

Rejected for the core backend. Python frameworks are mature, but this project needs to demonstrate Go backend work.

### Controlled Go-native graph/pipeline

Accepted. It balances agentic structure, reliability, testability, and the target stack.

## Consequences

Positive:

- predictable execution;
- easier progress UI;
- easier unit testing with mocked LLM outputs;
- clear explanation in technical interviews.

Negative:

- less flexible than autonomous agents;
- more upfront schema design.

## Validation

Each agent must be testable with fixture input and mocked model output. The progress UI should expose the pipeline stages so the agent workflow is visible.

