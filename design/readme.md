# Technical Maturity Analyzer — Design System

A calm, evidence-first design system for a **recruiter-facing technical maturity analyzer**. The product is a focused analyst workspace for **one recruiter reviewing one candidate against one technical role**. It is *not* an ATS, a candidate-ranking tool, or a coding-assessment platform.

The system exists to make four screens feel like a trustworthy analyst tool: **Job Input → Candidate Evidence → Analysis Progress → Report**. The output is evidence — a 2×2 matrix, qualitative signals, and STAR interview questions — never a match score or a hire/reject verdict.

## Sources

This system was built from the product's documentation repository (no UI existed yet — the repo is docs-only, and an ADR explicitly directs that the frontend visual design start here):

- **GitHub:** https://github.com/CafeSemCafeina/avaliador-tech-recruiter — *AI-native technical maturity scanner for recruiters.*
  - `README.md`, `PROJECT_SCOPE.md` — product concept and non-goals.
  - `docs/PRD.md` — full product requirements (screens, agent pipeline, data contracts, evidence matrix, badges).
  - `docs/adr/0002-evidence-first-no-final-score.md` — the core "no score" principle.
  - `docs/adr/0012-use-claude-design-for-frontend-ui.md` — directs Claude Design to define the screens.

Readers with access should explore that repository to extend these designs faithfully. No Figma file or component codebase was provided; the visual language below was established fresh against the brief.

---

## Content fundamentals

The product's voice is **careful, conservative, and uncertainty-preserving**. Copy never accuses and never concludes; it points to where a human should look.

- **Person & tone:** Neutral and operational. Addresses the recruiter as a peer analyst ("Add candidate evidence", "Continue to candidate evidence"). Avoids hype and first-person AI voice.
- **Casing:** Sentence case for headings and buttons ("Define the role baseline"). UPPERCASE only for mono eyebrows/labels with wide tracking ("SELECTED STACKS", "INTERVIEW FOCUS").
- **Preferred vocabulary:** *Needs validation · Confirmed by evidence · Public evidence suggests · Not publicly evidenced · Interview focus · Evidence source · Methodology · Limitations · Recruiter summary · Hiring manager summary.*
- **Forbidden vocabulary:** *Failed · Bad candidate · Unqualified · No experience · Match score · Hire · Reject · Pass/fail.* Missing evidence becomes a **question**, not a verdict ("Absence of public evidence is not evidence of absence").
- **Numbers:** Qualitative only. Signals read "Mid plausible", "Mixed", "Strong in React/TypeScript" — never percentages or scores.
- **Emoji:** None. Iconography is the Lucide outline set.
- **Vibe:** A senior analyst's prep notes — measured, sourced, and respectful of the candidate.

---

## Visual foundations

Professional, calm, evidence-oriented. The look is **light, bordered, and compact** — closer to Ashby / Linear restraint than a marketing page or a gamified dashboard.

- **Color:** Cool slate neutrals on a light `#f6f8fa` app background; white surfaces. A single **calm blue** accent (`#2f6bbf`) for links, focus, and primary actions. **Muted status hues** carry meaning — green (confirmed), amber (needs validation), clay (gap — never an alarming red), slate-blue (uncertain), blue (info). Status colors always appear as soft tints with a matching border, never large saturated fills.
- **Type:** The **IBM Plex** family — engineered and technical. *Plex Sans* for UI/body/headings, *Plex Mono* for data, eyebrows, stack tags, durations and field labels, *Plex Serif* for analyst-report prose (the executive summary). Sentence-case headings, mono micro-labels with `0.06em` tracking.
- **Spacing:** 4px base scale. Compact but breathable — generous card padding (16–24px), tight control heights (30/36/44px).
- **Backgrounds:** Flat. No gradients, no imagery, no texture. Depth comes from a 1px border first, then a whisper of shadow.
- **Borders & cards:** Cards are white, `10px` radius, 1px `--border-subtle`, with `--shadow-xs`. Status/quadrant cards add a 3px colored top accent or a tinted fill. Controls use `5–8px` radii.
- **Shadows:** A restrained scale (`xs`→`lg`). `xs`/`sm` for resting cards; reserve `md`/`lg` for overlays. Borders do most of the separation work.
- **Focus & states:** Focus = blue ring (`--shadow-focus`, a 3px 28%-alpha halo) + accent border. Hover = subtle background/border darkening (no large color shifts). Buttons don't bounce or scale; transitions are short (120–180ms) with a standard ease. The only motion is the analysis spinner and timeline fills.
- **Radii:** `sm 5 · md 8 · lg 10 · xl 14 · pill 999`. Chips/tags are pills; cards and panels are `lg`.
- **Layout:** Sticky 56px header + a centered wizard stepper. Form screens sit in a ~760px column; the report widens to ~1000px so the matrix can breathe in a 2-column grid.
- **Imagery:** None by design. Identity is shown with initials avatars (square-rounded, mono initials).

---

## Iconography

- **Set:** [Lucide](https://lucide.dev) outline icons, `1.75` stroke weight — calm, consistent, and matched to the type. Loaded via the Lucide UMD CDN (`lucide@0.460.0`); rendered through the `Icon` helper in `ui_kits/analyzer/icons.jsx`.
- **Usage:** Small (14–18px), `currentColor`, paired with text. Common glyphs: `file-text`, `linkedin`, `github`, `globe`, `link`, `shield`, `scan-line`, `check`, `arrow-right`, `download`, `layout-grid`, `message-square-quote`, `scale`.
- **No emoji, no unicode-as-icon, no hand-drawn SVG** in product surfaces. The only bespoke SVG is the brand mark.
- **Substitution flag:** Lucide is a substitution chosen for this system (the source repo specified none). Swap if the team adopts a different icon set.

---

## Brand

- **Logo:** A 2×2 evidence-matrix monogram — four rounded squares in the four status colors — directly encoding the product's core metaphor. `assets/logo-mark.svg` (square) and `assets/logo-lockup.svg` (with wordmark). The mark is the only intentionally-authored brand artwork.

---

## Index / manifest

**Root**
- `styles.css` — global entry (import this one file). `@import`s everything below.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css` (radii/shadow/motion), `fonts.css` (IBM Plex via Google Fonts), `base.css` (reset + keyframes).
- `assets/` — `logo-mark.svg`, `logo-lockup.svg`.
- `guidelines/` — foundation specimen cards (Design System tab): neutrals, accent, status, type scale, font families, spacing, radii/elevation, logo.
- `SKILL.md` — Agent-Skill entry point.

**Components** (`window.TechnicalMaturityAnalyzerDesignSystem_3be3ec`)
- `components/core/` — `Button`, `Card`, `Avatar`
- `components/forms/` — `Field`, `Input`, `Textarea`, `SegmentedControl`, `Tag`
- `components/feedback/` — `StatusBadge`, `Banner`, `StageItem`
- `components/recruiting/` — `QuadrantCard`, `StarQuestion`, `SourceCard`, `QualBadge`

**UI kits**
- `ui_kits/analyzer/` — the interactive four-screen recruiter flow (`index.html` + screen JSX). See its `README.md`.

> Fonts note: IBM Plex is linked from Google Fonts rather than self-hosted. Provide `.woff2` files if fully-offline use is required.
