# Analyzer — UI Kit

An interactive, four-screen recreation of the **Technical Maturity Analyzer** recruiter workspace. It composes the design-system component primitives (no re-implementation) against the global tokens.

## Run it

Open `index.html`. It is a click-through:

1. **Role baseline** (`JobInputScreen`) — job description, seniority, stack tags with up-to-3 primary marking, recruiter notes.
2. **Candidate evidence** (`CandidateEvidenceScreen`) — resume / LinkedIn / GitHub / portfolio source cards with required-vs-optional state and the privacy banner.
3. **Analysis** (`AnalysisProgressScreen`) — the 10-stage agentic pipeline timeline; stages auto-advance through pending → running → completed/warning.
4. **Report** (`ReportScreen`) — executive summary, qualitative signals, the 2×2 evidence matrix (the visual center), STAR questions, recruiter & hiring-manager summaries, collapsible methodology.

Step state persists to `localStorage` (`tma_step`) so a refresh keeps your place.

## Files

| File | Role |
| --- | --- |
| `index.html` | Loads React, Babel, Lucide, the DS bundle, and orchestrates the step flow. |
| `AppShell.jsx` | Header + wizard stepper. Exposes `window.AppShell`, `window.Stepper`. |
| `icons.jsx` | `window.Icon` — renders a real Lucide icon (CDN). |
| `JobInputScreen.jsx` | Screen 1. |
| `CandidateEvidenceScreen.jsx` | Screen 2. |
| `AnalysisProgressScreen.jsx` | Screen 3. |
| `ReportScreen.jsx` | Screen 4. |

## Dependencies

- Components via `window.TechnicalMaturityAnalyzerDesignSystem_3be3ec` (the compiled `_ds_bundle.js`).
- Icons via Lucide UMD CDN (`lucide@0.460.0`).
- Tokens via the root `styles.css`.

## Notes

- These are cosmetic recreations for prototyping — inputs hold local state but nothing is persisted to a backend.
- The product intentionally shows **no match score and no hire/reject verdict**; keep that constraint if you extend these screens.
