# ADR 0006 - Use LinkedIn export upload instead of live scraping

Status: Accepted  
Date: 2026-06-20

## Context

LinkedIn is a useful source of public professional signals, but live scraping is fragile and can require cookies, browser automation, paid actors, or unstable third-party APIs.

For an MVP meant to be shown publicly, reliability and respectful data handling matter more than scraping depth.

## Decision

Support LinkedIn through user-provided export, PDF, screenshot-to-PDF, or pasted text.

The UI should clearly state:

- no login is required;
- no cookies are requested;
- private data is not accessed;
- the system analyzes only user-provided content.

An Apify connector may be considered later as an optional integration, but it is not required for the MVP.

## Alternatives considered

### Scrape LinkedIn directly

Rejected. It is risky, unstable, and unnecessary for the first demo.

### Use Apify as the default path

Rejected for MVP. Useful later, but actors vary in quality, price, limits, and reliability.

### Manual PDF/text input

Accepted. It is stable, transparent, and easy to explain.

## Consequences

Positive:

- reliable demo path;
- fewer privacy concerns;
- simpler backend;
- no dependency on scraping limits.

Negative:

- less automated;
- user must provide the LinkedIn content manually.

## Validation

The product must support analysis with LinkedIn text absent, partial, or manually pasted. The final report must label LinkedIn as candidate-provided public evidence, not ground truth.

