package pipeline

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"testing"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/eval"
)

// fakeLLMClient implements LLMClient for offline testing.
type fakeLLMClient struct {
	responses map[string]string
	fallback  string
}

func (f *fakeLLMClient) Generate(_ context.Context, prompt string) (string, error) {
	// Iterate keys in sorted order so a prompt that happens to match more than
	// one key resolves deterministically (no reliance on map iteration order).
	keys := make([]string, 0, len(f.responses))
	for k := range f.responses {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, key := range keys {
		if strings.Contains(prompt, key) {
			return f.responses[key], nil
		}
	}
	if f.fallback != "" {
		return f.fallback, nil
	}
	return "", fmt.Errorf("fakeLLMClient: no response matched prompt %q", prompt)
}

// sampleFakeResponses returns mock JSON responses representing clean Gemini outputs
// that match the contract schemas expected by each stage.
func sampleFakeResponses() map[string]string {
	return map[string]string{
		"ResumeEvidenceAgent":           `{"skills": [{"name": "React", "detail": "Worked 2 years with it", "confidence": "explicit"}]}`,
		"JobProfileAgent":               `{"primaryRequirements": ["React", "TypeScript"], "desirableRequirements": ["Go"], "seniorityExpectations": "Expects mid level seniority.", "technicalRisks": []}`,
		"EvidenceCheckerAgent":          `{"checkedSkills": [{"name": "React", "status": "confirmed", "rationale": "evidenced in resume and github", "sources": [{"kind": "resume", "detail": "claims React"}, {"kind": "github", "detail": "repo contains React"}]}]}`,
		"QuadrantClassifierAgent":       `{"evidenceMatrix": [{"title": "React practice", "quadrant": "strong_with_evidence", "sources": [{"kind": "resume", "detail": "claims React"}, {"kind": "github", "detail": "repo contains React"}], "rationale": "evidenced in resume and github", "interviewFocus": "ask about component design", "starRefs": ["star_1"]}], "confirmedStrengths": [{"statement": "Evidenced React practice across public work.", "sources": [{"kind": "resume", "detail": "claims React"}, {"kind": "github", "detail": "repo contains React"}]}], "strengthsNeedingValidation": [], "confirmedGaps": [], "weakSignalsNeedingValidation": []}`,
		"STARQuestionAgent":             `{"starQuestions": [{"id": "star_1", "dimension": "React practice", "question": "Describe a time you optimized component rendering."}]}`,
		"TechnicalMaturityAnalystAgent": `{"executiveSummary": "Public evidence suggests a mid-level engineer. 1 signal well evidenced.", "badges": [{"label": "Mid role profile", "tone": "neutral"}, {"label": "Evidenced strengths present", "tone": "positive"}], "recruiterSummary": "Treat evidenced signals as established.", "hiringManagerSummary": "Evidenced strengths are traceable.", "limitations": []}`,
	}
}

// TestGeminiPipelineWithFakeClient tests AC1, AC2, and AC3.
func TestGeminiPipelineWithFakeClient(t *testing.T) {
	// Guard against network calls in test suite (AC4)
	orig := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = orig })
	http.DefaultTransport = forbiddenTransport{t}

	responses := sampleFakeResponses()
	fastClient := &fakeLLMClient{responses: responses}
	strongClient := &fakeLLMClient{responses: responses}
	p := NewGeminiPipeline(fastClient, strongClient)

	var events []StageEvent
	emit := func(e StageEvent) {
		events = append(events, e)
	}

	years := 4
	job := contract.JobInput{
		Description:     "Frontend role.",
		Seniority:       contract.SeniorityMid,
		YearsExperience: &years,
		StackTags:       []string{"React", "TypeScript"},
		PrimaryStacks:   []string{"React", "TypeScript"},
	}
	cand := contract.CandidateInput{
		ResumeText: "Experienced React developer.",
		GithubURL:  "https://github.com/example",
	}

	report, err := p.Run(context.Background(), "analysis-test-123", job, cand, emit)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}

	// AC1: Verify 10 stages are emitted in order
	expectedStages := len(Stages)
	if len(events) != 2*expectedStages { // Running + Completed/Warning per stage
		t.Errorf("expected %d stage events, got %d", 2*expectedStages, len(events))
	}

	for i, st := range Stages {
		runEv := events[2*i]
		compEv := events[2*i+1]
		if runEv.Stage != st.ID || runEv.Status != StageRunning {
			t.Errorf("stage %d: expected running state for %q, got %q (%s)", i, st.ID, runEv.Stage, runEv.Status)
		}
		if compEv.Stage != st.ID || (compEv.Status != StageCompleted && compEv.Status != StageWarning) {
			t.Errorf("stage %d: expected completed/warning state for %q, got %q (%s)", i, st.ID, compEv.Stage, compEv.Status)
		}
	}

	// AC3: Verify resulting report passes policy validation
	violations := eval.Validate(report, job.Seniority)
	if len(violations) > 0 {
		t.Errorf("report failed policy validation: %v", violations)
	}

	// Verify report fields match expected structured output
	if report.Seniority != job.Seniority {
		t.Errorf("expected seniority %q, got %q", job.Seniority, report.Seniority)
	}
	if len(report.EvidenceMatrix) != 1 || report.EvidenceMatrix[0].Title != "React practice" {
		t.Errorf("unexpected evidence matrix: %v", report.EvidenceMatrix)
	}
	if len(report.STARQuestions) != 1 || report.STARQuestions[0].ID != "star_1" {
		t.Errorf("unexpected STAR questions: %v", report.STARQuestions)
	}
}

// TestGeminiPipelineFallback tests AC5.
func TestGeminiPipelineFallback(t *testing.T) {
	// Guard against network calls
	orig := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = orig })
	http.DefaultTransport = forbiddenTransport{t}

	responses := sampleFakeResponses()
	// Force failure in ResumeEvidenceAgent by returning invalid JSON
	responses["ResumeEvidenceAgent"] = `invalid-json`

	fastClient := &fakeLLMClient{responses: responses}
	strongClient := &fakeLLMClient{responses: responses}
	p := NewGeminiPipeline(fastClient, strongClient)

	var events []StageEvent
	emit := func(e StageEvent) {
		events = append(events, e)
	}

	years := 4
	job := contract.JobInput{
		Description:     "Frontend role.",
		Seniority:       contract.SeniorityMid,
		YearsExperience: &years,
		StackTags:       []string{"React", "TypeScript"},
		PrimaryStacks:   []string{"React", "TypeScript"},
	}
	cand := contract.CandidateInput{
		ResumeText: "React developer.",
		GithubURL:  "https://github.com/example",
	}

	report, err := p.Run(context.Background(), "analysis-test-fallback", job, cand, emit)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}

	// AC5: parse_resume stage must complete with status warning
	foundWarning := false
	for _, ev := range events {
		if ev.Stage == "parse_resume" && ev.Status == StageWarning {
			foundWarning = true
			break
		}
	}
	if !foundWarning {
		t.Error("expected parse_resume stage to complete with warning status")
	}

	// Final report must still be valid and compliant
	violations := eval.Validate(report, job.Seniority)
	if len(violations) > 0 {
		t.Errorf("fallback report failed policy validation: %v", violations)
	}

	// Methodology step for parse_resume must show warning
	foundMethodologyWarning := false
	for _, step := range report.Methodology {
		if step.Stage == "parse_resume" && step.Status == string(StageWarning) {
			foundMethodologyWarning = true
			break
		}
	}
	if !foundMethodologyWarning {
		t.Error("expected methodology to record warning status for parse_resume")
	}

	// Limitations must document the degradation with a generic, candidate-safe
	// note (never raw model output or internal error detail).
	foundLimitationWarning := false
	for _, note := range report.Limitations {
		if strings.Contains(note, "conservative fallback") {
			foundLimitationWarning = true
		}
		if strings.Contains(note, "raw response") || strings.Contains(note, "JSON parse error") {
			t.Errorf("limitations leaked internal detail: %q", note)
		}
	}
	if !foundLimitationWarning {
		t.Error("expected limitations to append a generic degradation note")
	}
}

// TestPromptsContainForbiddenVocabulary tests AC6.
func TestPromptsContainForbiddenVocabulary(t *testing.T) {
	forbiddenList := eval.ForbiddenVocabulary()
	if len(forbiddenList) == 0 {
		t.Fatal("forbidden vocabulary list is empty")
	}

	vars := map[string]interface{}{
		"ForbiddenVocabulary": strings.Join(forbiddenList, ", "),
	}

	prompts := []struct {
		name string
		tmpl string
	}{
		{"job_profile", jobProfilePrompt},
		{"resume_evidence", resumeEvidencePrompt},
		{"evidence_checker", evidenceCheckerPrompt},
		{"quadrant_classifier", quadrantClassifierPrompt},
		{"star_questions", starQuestionsPrompt},
		{"analyst_review", analystReviewPrompt},
	}

	for _, p := range prompts {
		rendered, err := renderPrompt(p.tmpl, vars)
		if err != nil {
			t.Fatalf("prompt template %q failed to render: %v", p.name, err)
		}
		// Assert that the rendered prompt contains the forbidden words to instruct the model
		for _, term := range forbiddenList {
			if !strings.Contains(strings.ToLower(rendered), strings.ToLower(term)) {
				t.Errorf("rendered prompt %q does not contain forbidden term %q", p.name, term)
			}
		}
	}
}
