package pipeline

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

// Mock is the deterministic Tier 1 pipeline. For a given input it produces a
// byte-identical Report and makes no network or model calls. Its classification
// is text-driven so the L2 golden properties are stable: a primary stack the
// candidate claims and that has public code is evidenced; a claimed stack with
// no public code needs validation (never weak_with_evidence); a stack not
// claimed at all is a weak signal to validate, never a "gap".
type Mock struct{}

// NewMock returns the deterministic mock pipeline.
func NewMock() *Mock { return &Mock{} }

// fixedStageDuration returns a deterministic per-stage duration so the report's
// methodology block is stable across runs (mock determinism, spec 003 AC2).
func fixedStageDuration(i int) int64 { return int64(50 + i*10) }

// Run walks the ten stages in order, emitting running→completed for each, then
// builds the deterministic report. It never touches the network.
func (m *Mock) Run(ctx context.Context, analysisID string, job contract.JobInput, cand contract.CandidateInput, emit EmitFunc) (contract.Report, error) {
	methodology := make([]contract.MethodologyStep, 0, len(Stages))
	for i, st := range Stages {
		if err := ctx.Err(); err != nil {
			if emit != nil {
				emit(StageEvent{AnalysisID: analysisID, Stage: st.ID, Name: st.Name, Status: StageFailed, Message: "cancelled", Timestamp: time.Now().UTC(), Error: err.Error()})
			}
			return contract.Report{}, err
		}
		now := time.Now().UTC()
		if emit != nil {
			emit(StageEvent{AnalysisID: analysisID, Stage: st.ID, Name: st.Name, Status: StageRunning, Message: st.Name, Timestamp: now})
		}
		dur := fixedStageDuration(i)
		if emit != nil {
			emit(StageEvent{AnalysisID: analysisID, Stage: st.ID, Name: st.Name, Status: StageCompleted, Message: st.Name + " complete", Timestamp: time.Now().UTC(), DurationMs: dur})
		}
		methodology = append(methodology, contract.MethodologyStep{Stage: st.ID, Name: st.Name, Status: string(StageCompleted), DurationMs: dur})
	}
	return buildReport(job, cand, methodology), nil
}

// buildReport deterministically assembles a policy-compliant Report from the
// inputs and the stage timeline.
func buildReport(job contract.JobInput, cand contract.CandidateInput, methodology []contract.MethodologyStep) contract.Report {
	candidateText := strings.ToLower(strings.Join([]string{cand.ResumeText, cand.LinkedinText, cand.Notes}, "\n"))
	hasGitHub := strings.TrimSpace(cand.GithubURL) != ""
	hasResume := strings.TrimSpace(cand.ResumeText) != ""

	var (
		matrix     []contract.QuadrantItem
		strengths  []contract.Finding
		strengthsV []contract.ValidationItem
		starQs     = baselineStarQuestions()
		strongN    int
		validateN  int
	)

	for _, stack := range dedupe(job.PrimaryStacks) {
		claimed := strings.Contains(candidateText, strings.ToLower(stack))
		switch {
		case claimed && hasGitHub:
			srcs := []contract.Source{{Kind: contract.SourceGitHub, Detail: "public repositories reference " + stack}}
			if hasResume {
				srcs = append(srcs, contract.Source{Kind: contract.SourceResume, Detail: "resume references " + stack})
			}
			matrix = append(matrix, contract.QuadrantItem{
				Title:          stack + " practice",
				Quadrant:       contract.QuadrantStrongWithEvidence,
				Sources:        srcs,
				Rationale:      "Public evidence and the resume both reference " + stack + " work.",
				InterviewFocus: "Ask the candidate to walk through a recent " + stack + " decision and its trade-offs.",
				STARRefs:       []string{"star_1"},
			})
			strengths = append(strengths, contract.Finding{
				Statement: "Evidenced " + stack + " practice across public work and the resume.",
				Sources:   srcs,
			})
			strongN++
		case claimed && !hasGitHub:
			matrix = append(matrix, contract.QuadrantItem{
				Title:          stack + " practice",
				Quadrant:       contract.QuadrantStrongNeedsValidation,
				Sources:        nil,
				Rationale:      "The resume references " + stack + ", but no public code was provided to corroborate it.",
				InterviewFocus: "Ask the candidate to describe a concrete " + stack + " project and their specific role.",
			})
			strengthsV = append(strengthsV, contract.ValidationItem{
				Statement:      "Self-reported " + stack + " experience.",
				InterviewFocus: "Have the candidate describe the work and their responsibilities in detail.",
			})
			validateN++
		default:
			matrix = append(matrix, contract.QuadrantItem{
				Title:          stack + " practice",
				Quadrant:       contract.QuadrantWeakNeedsValidation,
				Sources:        nil,
				Rationale:      stack + " is a primary stack for the role but is not publicly evidenced; this is a question for the interview, not a conclusion.",
				InterviewFocus: "Ask how the candidate would approach a task in " + stack + ".",
			})
			validateN++
		}
	}

	if len(matrix) == 0 {
		matrix = append(matrix, contract.QuadrantItem{
			Title:          "Overall engineering signal",
			Quadrant:       contract.QuadrantWeakNeedsValidation,
			Sources:        nil,
			Rationale:      "No primary stacks were specified, so overall signal is best explored directly in the interview.",
			InterviewFocus: "Use a broad technical walkthrough to surface depth.",
		})
		validateN++
	}

	weakSignals := buildWeakSignals(cand)

	report := contract.Report{
		Seniority:                    job.Seniority,
		ExecutiveSummary:             buildExecutiveSummary(job.Seniority, strongN, validateN),
		Badges:                       buildBadges(job.Seniority, strongN, validateN),
		EvidenceMatrix:               matrix,
		ConfirmedStrengths:           emptyIfNil(strengths),
		StrengthsNeedingValidation:   emptyValidationIfNil(strengthsV),
		ConfirmedGaps:                []contract.Finding{},
		WeakSignalsNeedingValidation: weakSignals,
		STARQuestions:                starQs,
		RecruiterSummary:             "Treat the well-evidenced signals as established and the validation items as interview questions rather than conclusions.",
		HiringManagerSummary:         "Evidenced strengths are traceable to public work. Claims without public corroboration are framed as interview-validation items, not conclusions about the candidate.",
		Methodology:                  methodology,
		Limitations: []string{
			"Analysis is based only on the public evidence and text provided.",
			"Absence of public evidence is treated as a question for the interview, not as a conclusion about the candidate.",
		},
	}
	return report
}

func buildExecutiveSummary(s contract.Seniority, strongN, validateN int) string {
	return fmt.Sprintf(
		"Public evidence suggests a %s-level engineer. %d signal(s) are well evidenced; %d are noted for interview validation rather than treated as conclusions.",
		s, strongN, validateN,
	)
}

func buildBadges(s contract.Seniority, strongN, validateN int) []contract.Badge {
	badges := []contract.Badge{{Label: seniorityLabel(s) + " role profile", Tone: "neutral"}}
	if strongN > 0 {
		badges = append(badges, contract.Badge{Label: "Evidenced strengths present", Tone: "positive"})
	}
	if validateN > 0 {
		badges = append(badges, contract.Badge{Label: "Some signals need validation", Tone: "neutral"})
	}
	return badges
}

func buildWeakSignals(cand contract.CandidateInput) []contract.ValidationItem {
	items := []contract.ValidationItem{}
	if strings.TrimSpace(cand.GithubURL) == "" {
		items = append(items, contract.ValidationItem{
			Statement:      "No public code repository was provided.",
			InterviewFocus: "Ask the candidate to walk through a representative project they built.",
		})
	}
	if strings.TrimSpace(cand.PortfolioURL) == "" {
		items = append(items, contract.ValidationItem{
			Statement:      "No portfolio was provided.",
			InterviewFocus: "Ask the candidate to describe a project they are proud of and why.",
		})
	}
	if len(items) == 0 {
		items = append(items, contract.ValidationItem{
			Statement:      "Operational and deployment experience is not fully evidenced.",
			InterviewFocus: "Ask about a time the candidate took a change from commit to production.",
		})
	}
	return items
}

func baselineStarQuestions() []contract.STARQuestion {
	return []contract.STARQuestion{
		{ID: "star_1", Dimension: "technical depth", Question: "Describe a situation where a technical decision you made had to change. What was the task, what actions did you take, and what was the result?"},
		{ID: "star_2", Dimension: "collaboration", Question: "Tell me about a time you disagreed with a technical decision on your team. How did you handle it and what happened?"},
	}
}

func seniorityLabel(s contract.Seniority) string {
	str := string(s)
	if str == "" {
		return "Unspecified"
	}
	return strings.ToUpper(str[:1]) + str[1:]
}

func dedupe(in []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(in))
	for _, v := range in {
		v = strings.TrimSpace(v)
		if v == "" || seen[strings.ToLower(v)] {
			continue
		}
		seen[strings.ToLower(v)] = true
		out = append(out, v)
	}
	return out
}

func emptyIfNil(in []contract.Finding) []contract.Finding {
	if in == nil {
		return []contract.Finding{}
	}
	return in
}

func emptyValidationIfNil(in []contract.ValidationItem) []contract.ValidationItem {
	if in == nil {
		return []contract.ValidationItem{}
	}
	return in
}
