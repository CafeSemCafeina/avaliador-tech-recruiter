// Package export renders a completed Report to Markdown — the MVP's durable
// artifact (spec 005). The document is generated from the same Report object the
// UI renders, never re-derived, so the export and the screen cannot diverge.
// Render is a pure function: it takes only a Report and performs no I/O.
package export

import (
	"fmt"
	"strings"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

// quadrantSection pairs a quadrant value with its human heading, in the order
// the matrix renders.
var quadrantSections = []struct {
	q       contract.Quadrant
	heading string
}{
	{contract.QuadrantStrongWithEvidence, "Strong with evidence"},
	{contract.QuadrantStrongNeedsValidation, "Strong, needs validation"},
	{contract.QuadrantWeakWithEvidence, "Weak with evidence"},
	{contract.QuadrantWeakNeedsValidation, "Weak, needs validation"},
}

// Render returns the deterministic Markdown for a report. Sections appear in the
// TECHNICAL_DESIGN §5 order; the four-quadrant matrix renders as four labelled
// groups with each item's title, rationale, sources, and interview focus.
func Render(r contract.Report) string {
	var b strings.Builder

	b.WriteString("# Technical maturity analysis\n\n")
	fmt.Fprintf(&b, "_Seniority profile: %s_\n\n", seniorityLabel(r.Seniority))

	b.WriteString("## Executive summary\n\n")
	b.WriteString(paragraph(r.ExecutiveSummary))

	b.WriteString("## Badges\n\n")
	for _, badge := range r.Badges {
		fmt.Fprintf(&b, "- %s (%s)\n", badge.Label, badge.Tone)
	}
	b.WriteString("\n")

	b.WriteString("## Evidence matrix\n\n")
	for _, sec := range quadrantSections {
		fmt.Fprintf(&b, "### %s\n\n", sec.heading)
		items := itemsFor(r.EvidenceMatrix, sec.q)
		if len(items) == 0 {
			b.WriteString("_None._\n\n")
			continue
		}
		for _, it := range items {
			fmt.Fprintf(&b, "#### %s\n\n", it.Title)
			fmt.Fprintf(&b, "- Rationale: %s\n", it.Rationale)
			fmt.Fprintf(&b, "- Sources: %s\n", renderSources(it.Sources))
			fmt.Fprintf(&b, "- Interview focus: %s\n\n", it.InterviewFocus)
		}
	}

	b.WriteString("## Confirmed strengths\n\n")
	writeFindings(&b, r.ConfirmedStrengths)

	b.WriteString("## Strengths needing validation\n\n")
	writeValidationItems(&b, r.StrengthsNeedingValidation)

	b.WriteString("## Confirmed gaps\n\n")
	writeFindings(&b, r.ConfirmedGaps)

	b.WriteString("## Weak signals needing validation\n\n")
	writeValidationItems(&b, r.WeakSignalsNeedingValidation)

	b.WriteString("## STAR interview questions\n\n")
	for _, q := range r.STARQuestions {
		fmt.Fprintf(&b, "- **%s** — %s\n", q.Dimension, q.Question)
	}
	b.WriteString("\n")

	b.WriteString("## Recruiter summary\n\n")
	b.WriteString(paragraph(r.RecruiterSummary))

	b.WriteString("## Hiring manager summary\n\n")
	b.WriteString(paragraph(r.HiringManagerSummary))

	b.WriteString("## Methodology\n\n")
	for _, m := range r.Methodology {
		if m.DurationMs > 0 {
			fmt.Fprintf(&b, "- %s — %s (%dms)\n", m.Name, m.Status, m.DurationMs)
		} else {
			fmt.Fprintf(&b, "- %s — %s\n", m.Name, m.Status)
		}
	}
	b.WriteString("\n")

	b.WriteString("## Limitations\n\n")
	for _, l := range r.Limitations {
		fmt.Fprintf(&b, "- %s\n", l)
	}

	return b.String()
}

func itemsFor(matrix []contract.QuadrantItem, q contract.Quadrant) []contract.QuadrantItem {
	var out []contract.QuadrantItem
	for _, it := range matrix {
		if it.Quadrant == q {
			out = append(out, it)
		}
	}
	return out
}

func renderSources(sources []contract.Source) string {
	if len(sources) == 0 {
		return "not yet evidenced"
	}
	parts := make([]string, 0, len(sources))
	for _, s := range sources {
		parts = append(parts, fmt.Sprintf("%s — %s", s.Kind, s.Detail))
	}
	return strings.Join(parts, "; ")
}

func writeFindings(b *strings.Builder, fs []contract.Finding) {
	if len(fs) == 0 {
		b.WriteString("_None._\n\n")
		return
	}
	for _, f := range fs {
		fmt.Fprintf(b, "- %s (Sources: %s)\n", f.Statement, renderSources(f.Sources))
	}
	b.WriteString("\n")
}

func writeValidationItems(b *strings.Builder, vs []contract.ValidationItem) {
	if len(vs) == 0 {
		b.WriteString("_None._\n\n")
		return
	}
	for _, v := range vs {
		fmt.Fprintf(b, "- %s — Interview focus: %s\n", v.Statement, v.InterviewFocus)
	}
	b.WriteString("\n")
}

func paragraph(s string) string { return strings.TrimSpace(s) + "\n\n" }

func seniorityLabel(s contract.Seniority) string {
	str := string(s)
	if str == "" {
		return "Unspecified"
	}
	return strings.ToUpper(str[:1]) + str[1:]
}
