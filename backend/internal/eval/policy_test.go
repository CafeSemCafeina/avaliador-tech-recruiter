package eval_test

import (
	"context"
	"os"
	"strings"
	"testing"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/eval"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
)

// baseReport returns a compliant report (the deterministic mock output) to
// mutate in the negative tests.
func baseReport(t *testing.T) contract.Report {
	t.Helper()
	years := 4
	job := contract.JobInput{Seniority: contract.SeniorityMid, YearsExperience: &years,
		StackTags: []string{"React", "TypeScript"}, PrimaryStacks: []string{"React", "TypeScript"}}
	cand := contract.CandidateInput{ResumeText: "React and TypeScript work", GithubURL: "https://github.com/example", PortfolioURL: "https://example.dev"}
	rep, err := pipeline.NewMock().Run(context.Background(), "a", job, cand, nil)
	if err != nil {
		t.Fatalf("mock run: %v", err)
	}
	return rep
}

func hasRule(vs []eval.Violation, rule string) bool {
	for _, v := range vs {
		if v.Rule == rule {
			return true
		}
	}
	return false
}

// AC7: the compliant mock report passes with zero violations.
func TestMockReportPassesClean(t *testing.T) {
	r := baseReport(t)
	if vs := eval.Validate(r, r.Seniority); len(vs) != 0 {
		t.Fatalf("expected zero violations, got: %v", vs)
	}
}

// AC1: forbidden vocabulary in any text field is rejected.
func TestForbiddenVocabularyRejected(t *testing.T) {
	r := baseReport(t)
	r.ExecutiveSummary = "The candidate is Unqualified for this role."
	if vs := eval.Validate(r, r.Seniority); !hasRule(vs, eval.RuleForbiddenVocabulary) {
		t.Fatalf("expected forbidden_vocabulary violation, got: %v", vs)
	}
}

// AC2: a numeric fit/score value or score-like word is rejected.
func TestNumericScoreRejected(t *testing.T) {
	r := baseReport(t)
	r.RecruiterSummary = "Overall the candidate scored 85% on our rubric."
	vs := eval.Validate(r, r.Seniority)
	if !hasRule(vs, eval.RuleNoScore) {
		t.Fatalf("expected no_score violation, got: %v", vs)
	}
}

// AC3: a weak_with_evidence item with empty sources is rejected.
func TestWeakWithEvidenceNeedsSources(t *testing.T) {
	r := baseReport(t)
	r.EvidenceMatrix = append(r.EvidenceMatrix, contract.QuadrantItem{
		Title: "Testing", Quadrant: contract.QuadrantWeakWithEvidence,
		Rationale: "r", InterviewFocus: "f", Sources: nil,
	})
	if vs := eval.Validate(r, r.Seniority); !hasRule(vs, eval.RuleMissingEvidence) {
		t.Fatalf("expected missing_evidence violation, got: %v", vs)
	}
}

// AC4: any with-evidence conclusion lacking a source is rejected.
func TestUnsourcedConclusionRejected(t *testing.T) {
	r := baseReport(t)
	r.ConfirmedStrengths = append(r.ConfirmedStrengths, contract.Finding{Statement: "Strong system design", Sources: nil})
	if vs := eval.Validate(r, r.Seniority); !hasRule(vs, eval.RuleSourcing) {
		t.Fatalf("expected sourcing violation, got: %v", vs)
	}
}

// AC5: a report whose seniority differs from the job is flagged.
func TestSeniorityEchoFlagged(t *testing.T) {
	r := baseReport(t) // mid
	if vs := eval.Validate(r, contract.SenioritySenior); !hasRule(vs, eval.RuleSeniorityEcho) {
		t.Fatalf("expected seniority_echo violation, got: %v", vs)
	}
}

// AC6: demographic/protected-attribute references are rejected.
func TestDemographicInferenceRejected(t *testing.T) {
	r := baseReport(t)
	r.HiringManagerSummary = "The candidate appears to be a young man based on the photo."
	if vs := eval.Validate(r, r.Seniority); !hasRule(vs, eval.RuleDemographic) {
		t.Fatalf("expected no_demographic_inference violation, got: %v", vs)
	}
}

// The forbidden list has exactly one definition: assert the embedded machine
// source matches the human-facing list in design/readme.md (CLAUDE.md rule).
func TestForbiddenListMatchesDesignReadme(t *testing.T) {
	raw, err := os.ReadFile("../../../design/readme.md")
	if err != nil {
		t.Fatalf("read design/readme.md: %v", err)
	}
	idx := strings.Index(string(raw), "Forbidden vocabulary:")
	if idx < 0 {
		t.Fatal("could not find 'Forbidden vocabulary:' in design/readme.md")
	}
	var list string
	for _, part := range strings.Split(string(raw)[idx:], "*") {
		if strings.Contains(part, "·") {
			list = part
			break
		}
	}
	if list == "" {
		t.Fatal("could not parse the forbidden-vocabulary list from design/readme.md")
	}
	readme := map[string]bool{}
	for _, term := range strings.Split(list, "·") {
		term = strings.TrimSpace(strings.TrimRight(strings.TrimSpace(term), "."))
		if term != "" {
			readme[term] = true
		}
	}
	embedded := map[string]bool{}
	for _, term := range eval.ForbiddenVocabulary() {
		embedded[term] = true
	}
	for term := range readme {
		if !embedded[term] {
			t.Errorf("term %q is in design/readme.md but missing from forbidden_vocabulary.txt", term)
		}
	}
	for term := range embedded {
		if !readme[term] {
			t.Errorf("term %q is in forbidden_vocabulary.txt but missing from design/readme.md", term)
		}
	}
}
