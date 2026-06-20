# ADR 0013 - Build with a hybrid orchestrator-plus-specialist agent workflow

Status: Accepted  
Date: 2026-06-20

## Context

This MVP is built primarily by AI coding agents, and several agent resources are available, each with a different cost/precision profile:

- **Claude Code** (subscription): precise, strong at orchestration, spec adherence, and cross-cutting refactors; marginal cost is effectively flat.
- **Gemini family via Antigravity**: large context, fast, cheap per token, runs multiple agents in parallel; broad but less precise.
- **OpenAI frontier models via Codex**: high precision on bounded problems; expensive per token; can run isolated cloud/branch tasks.
- **Copilot small models** (e.g. GPT-class mini, Haiku-class): cheap, suitable for mechanical, low-risk work.

Two development methods are in tension:

- **Spec-driven inline execution** (one general agent, serial): high precision, low cost on a subscription, easy to keep coherent — but slower, and a single critical path.
- **Specialist sub-agent swarm** (multiple agents on their own branches/contexts): much faster through parallelism, but less precise and more expensive, and it fails badly when workers produce code that does not integrate.

The deciding insight is that this project already has the two artifacts that make a swarm *safe* rather than just fast and messy:

- **Frozen data contracts** ([PRD §14](../PRD.md)) — an unambiguous seam every worker codes against.
- **Evaluation gates** ([EVALUATION.md](../EVALUATION.md), layers L0/L1/L2) — a machine-checkable definition of "done."

With both in place, a worker's imprecision is caught at the gate and becomes a *retry cost*, not a *defect that ships*. Without them, parallel agents produce fast output that silently diverges. This ADR records how we combine the two methods given that foundation. It complements [ADR 0011](0011-use-gemini-and-spike-google-adk.md) (which provider runs the product's own agents) — this ADR is about which agents *build the software*.

## Decision

Build with a **hybrid workflow**: a single precise orchestrator owns the seam; specialist workers fan out on partitioned work, gated by the eval suite.

1. **Spec-driven foundation is the precondition, not an alternative.** The contracts and eval gates are written first and frozen. The swarm is only enabled because they exist.
2. **Claude Code is the permanent orchestrator/integrator.** It owns the contracts, the `LLMClient` abstraction, the `internal/eval` validator, the integration branch, review, and merges — the places where a mistake is most expensive.
3. **Specialist workers fan out behind the gate**, each in its own git worktree on a partitioned package, each handed a one-page work order (contract excerpt + interface + the exact eval/test command that must pass + do-not-touch paths). Engines are assigned by strength × cost:
   - **Gemini/Antigravity** → high-volume, large-context, mechanical slices: GitHub static analyzer, document parsing, portfolio crawler, design-system→React conversion, fixture generation.
   - **Codex/frontier** → bounded, correctness-critical slices: SSE job runner, quadrant-classification logic, STAR prompts, tricky concurrency, E2E.
   - **Copilot small models** → low-risk mechanical work: scaffolding, doc formatting, repetitive lint fixes.
4. **Phase by parallelizability.** Tier 0 (the seam) is built serially inline because it *defines* what workers code against and cannot be parallelized. The swarm is enabled from Tier 1 onward, where slices are independent. See [EXECUTION_PLAN.md](../EXECUTION_PLAN.md).
5. **The gate is the merge filter.** Nothing merges to the integration branch until L0/L1/L2(mock) are green. Human review supplements; it does not replace the gate.

## Resource trade-offs

- **Precision vs speed.** Inline is precise but serial; the swarm is fast but looser. We take precision where it is cheap-and-critical (the seam, via the subscription orchestrator) and speed where it is safe (gated, partitioned slices).
- **Cost vs throughput.** Frontier/swarm tokens are expensive. The cost rule: fan out an engine *only* on work that is (a) parallelizable, (b) precisely specified, (c) high-volume. Fuzzy work stays inline — fuzzy + swarm is the worst quadrant (expensive *and* imprecise). High-token mechanical work goes to the cheap large-context engine, not the frontier one.
- **Speedup is capped (Amdahl's law).** The serial seam is ~30–40% of reaching the first demonstrable result, so maximum speedup is ~2.5–3× even with unlimited workers; integration tax (review, conflicts, gate retries) removes 20–40% more and grows with worker count. Realistic gain to the first result is ~1.5–1.8×, increasing in later tiers where more slices run in parallel.
- **Imprecision is converted, not eliminated.** The eval gate turns worker imprecision into retry cost rather than shipped defects. This is the entire reason the swarm is acceptable here.
- **Coordination overhead is real.** Worktrees, work orders, partitioning, and merges cost orchestrator time; this only pays off once enough independent slices exist (Tier 1+), which is why Tier 0 stays inline.

## Alternatives considered

### Pure spec-driven inline execution

Rejected as the sole method. It is the most precise and the cheapest on a subscription, and it remains the method for Tier 0 and for any under-specified work. But it serializes everything and leaves the available Gemini/Codex/Copilot capacity idle, which is wasteful once independent slices exist.

### Fully autonomous swarm from day one

Rejected. Without the contracts and eval gates in place first, parallel agents produce fast, divergent output that does not integrate. It is also the most expensive and least predictable option, and it contradicts the controlled-pipeline philosophy in [ADR 0003](0003-controlled-go-native-agent-pipeline.md).

### Single frontier model for everything

Rejected. Highest precision per task, but the most expensive way to do high-volume mechanical work, and still serial. It wastes frontier capability on file-shuffling that a cheap large-context model does well enough.

### Hybrid orchestrator + gated specialist workers

Accepted. It captures most of the swarm's speed while bounding its imprecision and cost with the contracts and eval gates the project already requires.

## Consequences

Positive:

- parallel throughput on independent slices without sacrificing integration safety;
- each engine used where its cost/precision profile fits;
- the eval gate gives an objective, automated merge criterion;
- the method degrades gracefully — if a worker engine is unavailable, the orchestrator can absorb its slice inline.

Negative:

- requires the contracts and eval gates to be finished and frozen before the swarm starts (front-loaded effort);
- coordination overhead (worktrees, work orders, merges) that only pays off at Tier 1+;
- multiple paid engines add billing surface and require attention to token spend;
- a strong eval suite is now load-bearing — weak gates would let imprecise output through.

## Validation

- Tier 0 is built serially inline; the swarm is not enabled until the contracts and L0/L1/L2 gates exist and pass ([EXECUTION_PLAN.md](../EXECUTION_PLAN.md)).
- Every swarm slice merges only after its work-order eval command is green on the integration branch.
- If the realized speedup or the gate-failure (retry) rate makes the swarm uneconomical for a given tier, fall back to inline for that tier and record it here.
