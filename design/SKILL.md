---
name: technical-maturity-analyzer-design
description: Use this skill to generate well-branded interfaces and assets for the Technical Maturity Analyzer (an evidence-first, recruiter-facing technical screening tool), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Tokens:** link `styles.css` (root). It `@import`s `tokens/*` — colors, typography (IBM Plex), spacing/radii/shadows, fonts, base reset. Always design with the CSS custom properties (`--text-primary`, `--surface-card`, `--status-confirmed-fg`, etc.), not raw hex.
- **Components:** compiled into `_ds_bundle.js` under `window.TechnicalMaturityAnalyzerDesignSystem_3be3ec`. Each lives in `components/<group>/<Name>.jsx` with a `.prompt.md` describing usage. Read those before composing.
- **UI kit:** `ui_kits/analyzer/` is the canonical four-screen flow (Job Input → Candidate Evidence → Analysis Progress → Report) — the best reference for layout, density, and copy.
- **Icons:** Lucide outline set, 1.75 stroke, via CDN (`Icon` helper in `ui_kits/analyzer/icons.jsx`).

## Non-negotiable product constraints

This product **never** shows a match score, a ranking, or a hire/reject verdict. Keep language conservative and uncertainty-preserving ("Needs validation", "Public evidence suggests", "Not publicly evidenced"). Treat missing evidence as an interview question, not a gap. Use the muted status palette; never an alarming red. No emoji, no gradients, no marketing-hero styling.
