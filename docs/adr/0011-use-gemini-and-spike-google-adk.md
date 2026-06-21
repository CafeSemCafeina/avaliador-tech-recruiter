# ADR 0011 - Use Gemini first and spike Google ADK

Status: Accepted  
Date: 2026-06-20

## Context

The MVP needs a real LLM provider after the deterministic/mock pipeline is stable. The available provider key is Gemini, so the first real integration should use Google's ecosystem.

The project also needs to demonstrate agentic development without becoming a research project. Google offers multiple relevant options:

- Gemini API through the official Go SDK;
- Genkit Go;
- Google Agent Development Kit (ADK) for Go.

ADK is especially relevant because it is Go-native, supports Gemini, includes agent/tool abstractions, and provides deterministic workflow agents such as sequential workflows.

## Decision

Use Gemini as the first real LLM provider and run a short spike with Google ADK for Go before committing to the final agent implementation.

The planned model strategy is two-tier:

- fast/cheap Gemini model for extraction, summarization, and low-risk transformation;
- stronger Gemini model for evidence checking, quadrant classification, and final analyst reasoning.

The planned framework strategy is:

1. Build the first product slice with a deterministic/mock analysis pipeline.
2. Spike ADK Go with a small sequential workflow.
3. Adopt ADK if it can run a simple multi-step agent workflow with structured output without slowing the MVP.
4. Fall back to the official Gemini Go SDK through an internal `LLMClient` abstraction if ADK adds too much friction.

## Adoption criteria for ADK

ADK is accepted for the MVP only if the spike proves:

- a Go agent can run locally with `GOOGLE_API_KEY`;
- a simple sequential workflow can run two or more sub-agents in deterministic order;
- agent outputs can be converted into the project's JSON contracts;
- the implementation can be tested or mocked without live model calls;
- the dependency does not complicate container deployment beyond the MVP budget.

## Alternatives considered

### Gemini API through Go SDK only

Viable fallback. It is the simplest path and supports structured output, but it would make the agent orchestration mostly custom.

### Genkit Go

Possible later option. It is Google-native and agent-oriented, but ADK appears closer to the explicit agent workflow narrative for this project.

### ADK as mandatory architecture from day one

Rejected. It may be a strong fit, but it should not block the MVP before the base UI, API, contracts, tests, and mock pipeline exist.

### OpenAI or Anthropic first

Rejected for the first implementation because Gemini is the available provider key.

## Consequences

Positive:

- uses the available provider;
- keeps the project Go-native;
- demonstrates a real agent framework if the spike succeeds;
- preserves fallback path through `LLMClient`;
- avoids blocking UI/API progress on provider integration.

Negative:

- adds one spike task before finalizing the agent layer;
- ADK APIs may require adaptation to the project's JSON-first contracts;
- fallback implementation still needs to be maintained.

## Validation

The spike should produce a small documented result:

- command used to run it;
- whether ADK was accepted or rejected;
- reasons for the decision;
- any changes required to the agent architecture.

If ADK is accepted, update the PRD and implementation docs to name it as the agent framework. If rejected, update this ADR with the reason and proceed with Gemini Go SDK via `LLMClient`.

## Update — Vertex AI backend (2026-06-21)

Tier 2 (spec 006) is implemented with the Gemini Go SDK (`google.golang.org/genai`) behind `LLMClient`, as planned. During live verification the **Gemini Developer API** (AI Studio API key) returned `429 RESOURCE_EXHAUSTED — prepayment credits depleted` on every `generateContent` call, and the available **Google Cloud Free Trial** credit does not apply to that prepay billing.

**Decision:** support **both** genai backends behind the same `LLMClient`, selectable by environment, and default this project to **Vertex AI**, because the Free Trial credit covers Vertex AI Gemini:

- `GOOGLE_GENAI_USE_VERTEXAI=true` → Vertex AI backend, authenticated via Application Default Credentials (`gcloud auth application-default login`), billed to `GOOGLE_CLOUD_PROJECT` in `GOOGLE_CLOUD_LOCATION` (default `global`).
- unset/false → Gemini Developer API backend, authenticated via `GOOGLE_API_KEY`.

Both paths produce identical behavior through the pipeline; only client construction differs (`internal/llm`). The two-tier model strategy and per-agent mock fallback are unchanged. This keeps the provider seam intact and lets the project run real reasoning on the credit that is actually available.

**Consequences:** Vertex requires a GCP project + ADC (one-time `gcloud` login) rather than a single API key; the SDK and `LLMClient` contract are unchanged, so the rest of the system is unaffected.

