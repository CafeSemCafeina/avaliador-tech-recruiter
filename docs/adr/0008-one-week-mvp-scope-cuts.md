# ADR 0008 - Cut non-essential features to fit a one-week MVP

Status: Accepted  
Date: 2026-06-20

## Context

The product idea can easily expand into an ATS, sourcing tool, code sandbox, interview platform, and AI chat product. The goal is different: deliver a focused, usable MVP in one week.

## Decision

Cut or defer any feature that does not directly support the first useful demo:

1. Enter a role.
2. Enter candidate evidence.
3. Run analysis.
4. See evidence matrix.
5. Export STAR questions and summaries.

Deferred features:

- login/authentication;
- multi-user accounts;
- database-backed history;
- live LinkedIn scraping;
- executing candidate repositories;
- ATS integration;
- candidate ranking;
- final scores;
- Terraform;
- Kubernetes;
- billing/Stripe;
- full chat experience;
- multi-candidate comparison.

## Alternatives considered

### Build a broader recruiting platform

Rejected. Too large for the timeline and less likely to finish.

### Build only a static report generator

Rejected. Too small to demonstrate full-stack product engineering.

### Build a narrow but complete workflow

Accepted. The MVP should be small, end-to-end, testable, and deployable.

## Consequences

Positive:

- higher chance of finishing quickly;
- clearer demo;
- easier testing and deployment;
- better narrative around prioritization.

Negative:

- fewer enterprise features;
- some nice-to-haves become roadmap items.

## Validation

Any new feature must answer: does this improve the first demo within the one-week deadline? If not, it belongs in the roadmap.

