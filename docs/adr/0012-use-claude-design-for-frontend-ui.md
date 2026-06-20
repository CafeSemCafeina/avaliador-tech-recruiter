# ADR 0012 - Use Claude Design for frontend UI generation

Status: Accepted  
Date: 2026-06-20

## Context

The frontend must be usable and polished enough for a recruiter-facing demo, but the MVP timeline is short. The project also aims to demonstrate an AI-native product workflow, not only AI-assisted code generation.

Instead of hand-designing the UI from scratch or committing early to a generic component library, the team will use Claude Design to generate the initial visual language and screens.

## Decision

Use Claude Design as the first source for the frontend visual design.

Claude Design delivered a self-contained design system (not raw per-screen HTML): design tokens, brand assets, component primitives, foundation guidelines, and a four-screen UI kit. The expected flow is:

1. Generate the design system and the four screens in Claude Design.
2. Export and version the design system in the repository.
3. Convert the UI-kit screens into React + TypeScript components against the design tokens.
4. Reuse the tokens and component contracts rather than ad-hoc CSS.
5. Connect the components to the Go API contracts.

The four screens are:

- job input screen;
- candidate input screen;
- analysis progress screen;
- report screen.

Design artifacts are versioned under `design/` (entry: `design/styles.css`; tokens in `design/tokens/`; the canonical screens in `design/ui_kits/analyzer/`; design rules in `design/readme.md` and `design/SKILL.md`).

Converted application components should live under the frontend application once it is scaffolded.

## Alternatives considered

### Hand-design the UI in React from scratch

Rejected. It gives full control, but is slower and does not demonstrate the intended AI-native design workflow.

### Use shadcn/ui and Tailwind as the primary design system

Rejected as the default path. It is a strong option, but the chosen workflow is to start from Claude Design's HTML/CSS output. Component libraries may still be used later if they reduce implementation friction.

### Save only the final React components

Rejected. Keeping only the final implementation hides the design-to-code process.

### Save raw Claude Design output and converted React implementation

Accepted. This preserves traceability and shows how generated design artifacts were integrated into a typed frontend.

## Consequences

Positive:

- faster visual iteration;
- stronger evidence of AI-native workflow;
- raw design artifacts remain reviewable;
- implementation can still be typed and tested in React.

Negative:

- generated HTML/CSS may require cleanup;
- styles may need normalization for responsive behavior;
- conversion work is still required;
- generated UI must be reviewed for accessibility, layout, and copy quality.

## Validation

The raw Claude Design files should be committed before or alongside the React conversion. The final frontend should preserve the intended flow while using app state and typed API contracts.

At minimum, implementation should verify:

- job input screen renders;
- candidate input screen renders;
- progress screen can show agent stages;
- report screen can display badges, four-quadrant matrix, STAR questions, and methodology.

