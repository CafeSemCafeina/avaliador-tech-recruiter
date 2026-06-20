package pipeline

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

func collect(t *testing.T, job contract.JobInput, cand contract.CandidateInput) ([]StageEvent, contract.Report) {
	t.Helper()
	var events []StageEvent
	rep, err := NewMock().Run(context.Background(), "analysis_test", job, cand, func(e StageEvent) {
		events = append(events, e)
	})
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	return events, rep
}

// TestMockEmitsTenStagesInOrder covers spec 003 AC1.
func TestMockEmitsTenStagesInOrder(t *testing.T) {
	events, rep := collect(t, sampleJob(), sampleCandidate())
	if len(events) != 2*len(Stages) {
		t.Fatalf("expected %d events (running+completed per stage), got %d", 2*len(Stages), len(events))
	}
	for i, st := range Stages {
		run, done := events[2*i], events[2*i+1]
		if run.Stage != st.ID || run.Status != StageRunning {
			t.Errorf("stage %d: expected running %q, got %q/%s", i, st.ID, run.Stage, run.Status)
		}
		if done.Stage != st.ID || done.Status != StageCompleted {
			t.Errorf("stage %d: expected completed %q, got %q/%s", i, st.ID, done.Stage, done.Status)
		}
	}
	if err := rep.Validate(); err != nil {
		t.Fatalf("report invalid against contract: %v", err)
	}
}

// TestMockDeterministic covers spec 003 AC2.
func TestMockDeterministic(t *testing.T) {
	_, a := collect(t, sampleJob(), sampleCandidate())
	_, b := collect(t, sampleJob(), sampleCandidate())
	ja, _ := json.Marshal(a)
	jb, _ := json.Marshal(b)
	if string(ja) != string(jb) {
		t.Errorf("mock report not deterministic:\nA: %s\nB: %s", ja, jb)
	}
}

// TestMockGoldenProperties covers spec 003 AC3 — the L2 per-fixture properties.
func TestMockGoldenProperties(t *testing.T) {
	// Fixture A: claimed stack with public code → strong_with_evidence, sourced.
	_, a := collect(t,
		contract.JobInput{Seniority: contract.SeniorityMid, StackTags: []string{"React"}, PrimaryStacks: []string{"React"}},
		contract.CandidateInput{ResumeText: "Built apps with React for years", GithubURL: "https://github.com/example"},
	)
	react := findItem(t, a.EvidenceMatrix, "React practice")
	if react.Quadrant != contract.QuadrantStrongWithEvidence {
		t.Errorf("React: expected strong_with_evidence, got %s", react.Quadrant)
	}
	if len(react.Sources) == 0 {
		t.Error("React: expected ≥1 source for a with_evidence item")
	}

	// Fixture B: claimed stack, no public code → needs_validation, never weak_with_evidence.
	_, b := collect(t,
		contract.JobInput{Seniority: contract.SeniorityMid, StackTags: []string{"Go"}, PrimaryStacks: []string{"Go"}},
		contract.CandidateInput{ResumeText: "Owned a Go backend service"},
	)
	goItem := findItem(t, b.EvidenceMatrix, "Go practice")
	if goItem.Quadrant == contract.QuadrantWeakWithEvidence {
		t.Error("Go: must never be weak_with_evidence when there is no public evidence")
	}
	if !goItem.Quadrant.NeedsValidation() {
		t.Errorf("Go: expected a needs_validation quadrant, got %s", goItem.Quadrant)
	}
	if len(goItem.Sources) != 0 {
		t.Error("Go: a needs_validation item must not carry sources")
	}

	// Fixture C: no portfolio → a validation item, never a confirmed gap.
	if len(b.ConfirmedGaps) != 0 {
		t.Errorf("missing evidence must not become a confirmed gap, got %d", len(b.ConfirmedGaps))
	}
	if !hasStatementContaining(b.WeakSignalsNeedingValidation, "portfolio") {
		t.Error("expected a weak-signal validation item about the missing portfolio")
	}
}

// TestMockMakesNoNetworkCalls covers spec 003 AC4: install a transport that
// fails the test if any HTTP call is attempted, then run the mock.
func TestMockMakesNoNetworkCalls(t *testing.T) {
	orig := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = orig })
	http.DefaultTransport = forbiddenTransport{t}
	collect(t, sampleJob(), sampleCandidate())
}

type forbiddenTransport struct{ t *testing.T }

func (f forbiddenTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	f.t.Fatalf("mock pipeline attempted a network call to %s", r.URL)
	return nil, nil
}

func findItem(t *testing.T, matrix []contract.QuadrantItem, title string) contract.QuadrantItem {
	t.Helper()
	for _, it := range matrix {
		if it.Title == title {
			return it
		}
	}
	t.Fatalf("matrix item %q not found", title)
	return contract.QuadrantItem{}
}

func hasStatementContaining(items []contract.ValidationItem, sub string) bool {
	for _, it := range items {
		if containsFold(it.Statement, sub) {
			return true
		}
	}
	return false
}

func containsFold(s, sub string) bool {
	return len(sub) == 0 || (len(s) >= len(sub) && indexFold(s, sub) >= 0)
}

func indexFold(s, sub string) int {
	ls, lsub := toLower(s), toLower(sub)
	for i := 0; i+len(lsub) <= len(ls); i++ {
		if ls[i:i+len(lsub)] == lsub {
			return i
		}
	}
	return -1
}

func toLower(s string) string {
	b := []byte(s)
	for i := range b {
		if b[i] >= 'A' && b[i] <= 'Z' {
			b[i] += 'a' - 'A'
		}
	}
	return string(b)
}

func sampleJob() contract.JobInput {
	years := 4
	return contract.JobInput{
		Description:     "Frontend-leaning full stack role.",
		Seniority:       contract.SeniorityMid,
		YearsExperience: &years,
		StackTags:       []string{"React", "TypeScript", "Go"},
		PrimaryStacks:   []string{"React", "TypeScript"},
		Notes:           "Team values testing.",
	}
}

func sampleCandidate() contract.CandidateInput {
	return contract.CandidateInput{
		ResumeText:   "Senior frontend work in React and TypeScript across two products.",
		LinkedinText: "React, TypeScript, component libraries.",
		GithubURL:    "https://github.com/example",
		PortfolioURL: "",
		Notes:        "",
	}
}
