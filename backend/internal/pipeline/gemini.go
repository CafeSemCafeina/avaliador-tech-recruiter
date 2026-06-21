package pipeline

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"text/template"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/eval"
	ingestgithub "github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/ingest/github"
	ingestportfolio "github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/ingest/portfolio"
)

//go:embed prompts/job_profile.txt
var jobProfilePrompt string

//go:embed prompts/resume_evidence.txt
var resumeEvidencePrompt string

//go:embed prompts/evidence_checker.txt
var evidenceCheckerPrompt string

//go:embed prompts/quadrant_classifier.txt
var quadrantClassifierPrompt string

//go:embed prompts/star_questions.txt
var starQuestionsPrompt string

//go:embed prompts/analyst_review.txt
var analystReviewPrompt string

// GeminiPipeline implements pipeline.Pipeline using Gemini LLM models.
type GeminiPipeline struct {
	fastClient       LLMClient
	strongClient     LLMClient
	githubToken      string
	githubFetch      GitHubEvidenceFetcher
	portfolioFetch   PortfolioEvidenceFetcher
	portfolioOptions ingestportfolio.Options
}

// GitHubEvidenceFetcher fetches bounded public GitHub evidence for the Gemini pipeline.
type GitHubEvidenceFetcher func(context.Context, string, string) (ingestgithub.Evidence, error)

// PortfolioEvidenceFetcher fetches bounded public portfolio evidence for the Gemini pipeline.
type PortfolioEvidenceFetcher func(context.Context, string, ingestportfolio.Options) (ingestportfolio.Evidence, error)

// GeminiIngestionOptions configures optional public-evidence ingestion.
type GeminiIngestionOptions struct {
	GitHubToken      string
	GitHubFetch      GitHubEvidenceFetcher
	PortfolioFetch   PortfolioEvidenceFetcher
	PortfolioOptions ingestportfolio.Options
}

// NewGeminiPipeline returns a new GeminiPipeline.
func NewGeminiPipeline(fastClient, strongClient LLMClient) *GeminiPipeline {
	return NewGeminiPipelineWithIngestion(fastClient, strongClient, GeminiIngestionOptions{})
}

// NewGeminiPipelineWithIngestion returns a GeminiPipeline with injectable ingestion
// dependencies for production configuration and offline tests.
func NewGeminiPipelineWithIngestion(fastClient, strongClient LLMClient, opts GeminiIngestionOptions) *GeminiPipeline {
	githubFetch := opts.GitHubFetch
	if githubFetch == nil {
		githubFetch = ingestgithub.Fetch
	}
	portfolioFetch := opts.PortfolioFetch
	if portfolioFetch == nil {
		portfolioFetch = ingestportfolio.Fetch
	}
	return &GeminiPipeline{
		fastClient:       fastClient,
		strongClient:     strongClient,
		githubToken:      opts.GitHubToken,
		githubFetch:      githubFetch,
		portfolioFetch:   portfolioFetch,
		portfolioOptions: opts.PortfolioOptions,
	}
}

// Intermediate structures for parsed agent responses.
type jobProfileOut struct {
	PrimaryRequirements   []string `json:"primaryRequirements"`
	DesirableRequirements []string `json:"desirableRequirements"`
	SeniorityExpectations string   `json:"seniorityExpectations"`
	TechnicalRisks        []string `json:"technicalRisks"`
}

type resumeEvidenceOut struct {
	Skills []struct {
		Name       string `json:"name"`
		Detail     string `json:"detail"`
		Confidence string `json:"confidence"`
	} `json:"skills"`
}

type evidenceCheckerOut struct {
	CheckedSkills []struct {
		Name      string            `json:"name"`
		Status    string            `json:"status"`
		Rationale string            `json:"rationale"`
		Sources   []contract.Source `json:"sources"`
	} `json:"checkedSkills"`
}

type quadrantClassifierOut struct {
	EvidenceMatrix               []contract.QuadrantItem   `json:"evidenceMatrix"`
	ConfirmedStrengths           []contract.Finding        `json:"confirmedStrengths"`
	StrengthsNeedingValidation   []contract.ValidationItem `json:"strengthsNeedingValidation"`
	ConfirmedGaps                []contract.Finding        `json:"confirmedGaps"`
	WeakSignalsNeedingValidation []contract.ValidationItem `json:"weakSignalsNeedingValidation"`
}

type starQuestionsOut struct {
	StarQuestions []contract.STARQuestion `json:"starQuestions"`
}

type analystReviewOut struct {
	ExecutiveSummary     string           `json:"executiveSummary"`
	Badges               []contract.Badge `json:"badges"`
	RecruiterSummary     string           `json:"recruiterSummary"`
	HiringManagerSummary string           `json:"hiringManagerSummary"`
	Limitations          []string         `json:"limitations"`
}

type externalEvidenceContext struct {
	GitHub    githubEvidencePrompt    `json:"github"`
	Portfolio portfolioEvidencePrompt `json:"portfolio"`
}

type githubEvidencePrompt struct {
	Provided       bool                     `json:"provided"`
	Degraded       bool                     `json:"degraded"`
	Sources        []contract.Source        `json:"sources"`
	Owner          string                   `json:"owner,omitempty"`
	Repositories   []githubRepositoryPrompt `json:"repositories"`
	Languages      []string                 `json:"languages"`
	Manifests      []string                 `json:"manifests"`
	HasReadme      bool                     `json:"hasReadme"`
	HasCI          bool                     `json:"hasCI"`
	HasTests       bool                     `json:"hasTests"`
	HasDocker      bool                     `json:"hasDocker"`
	RecentActivity bool                     `json:"recentActivity"`
	LinksChecked   []string                 `json:"linksChecked"`
}

type githubRepositoryPrompt struct {
	FullName       string   `json:"fullName"`
	Languages      []string `json:"languages"`
	Manifests      []string `json:"manifests"`
	HasReadme      bool     `json:"hasReadme"`
	HasCI          bool     `json:"hasCI"`
	HasTests       bool     `json:"hasTests"`
	HasDocker      bool     `json:"hasDocker"`
	RecentActivity bool     `json:"recentActivity"`
}

type portfolioEvidencePrompt struct {
	Provided       bool              `json:"provided"`
	Degraded       bool              `json:"degraded"`
	Sources        []contract.Source `json:"sources"`
	URL            string            `json:"url,omitempty"`
	PagesFetched   []string          `json:"pagesFetched"`
	GitHubLinks    []string          `json:"githubLinks"`
	ProjectSignals []string          `json:"projectSignals"`
}

// Run executes the 10 stages of the pipeline in order, calling Gemini for text-only stages
// and falling back to deterministic mock structures on failure.
func (gp *GeminiPipeline) Run(ctx context.Context, analysisID string, job contract.JobInput, cand contract.CandidateInput, emit EmitFunc) (contract.Report, error) {
	if gp == nil || gp.fastClient == nil || gp.strongClient == nil {
		return contract.Report{}, errors.New("GeminiPipeline requires both fast and strong LLM clients")
	}

	methodology := make([]contract.MethodologyStep, 0, len(Stages))
	degraded := false

	// State accumulated between stages
	var resumeClaims resumeEvidenceOut
	var jobProfile jobProfileOut
	var checkedSkills evidenceCheckerOut
	var matrix quadrantClassifierOut
	var starQs starQuestionsOut
	var review analystReviewOut
	var githubEvidence ingestgithub.Evidence
	var portfolioEvidence ingestportfolio.Evidence

	forbiddenList := eval.ForbiddenVocabulary()
	forbiddenStr := strings.Join(forbiddenList, ", ")

	// Helper for running a stage
	runStage := func(idx int, stageID string, stageName string, runFunc func() error) error {
		if err := ctx.Err(); err != nil {
			if emit != nil {
				emit(StageEvent{AnalysisID: analysisID, Stage: stageID, Name: stageName, Status: StageFailed, Message: "cancelled", Timestamp: time.Now().UTC(), Error: err.Error()})
			}
			return err
		}

		startTime := time.Now().UTC()
		if emit != nil {
			emit(StageEvent{AnalysisID: analysisID, Stage: stageID, Name: stageName, Status: StageRunning, Message: stageName, Timestamp: startTime})
		}

		err := runFunc()

		endTime := time.Now().UTC()
		duration := endTime.Sub(startTime).Milliseconds()
		if ctxErr := ctx.Err(); ctxErr != nil {
			if emit != nil {
				emit(StageEvent{
					AnalysisID: analysisID,
					Stage:      stageID,
					Name:       stageName,
					Status:     StageFailed,
					Message:    "cancelled",
					Timestamp:  endTime,
					DurationMs: duration,
					Error:      ctxErr.Error(),
				})
			}
			methodology = append(methodology, contract.MethodologyStep{
				Stage:      stageID,
				Name:       stageName,
				Status:     string(StageFailed),
				DurationMs: duration,
			})
			return ctxErr
		}

		status := StageCompleted
		msg := stageName + " complete"
		if err != nil {
			status = StageWarning
			msg = stageName + " used a conservative fallback"
			degraded = true
			// Full detail (including any raw model output) goes to server logs
			// only — never into the candidate-facing report or SSE stream.
			log.Printf("GeminiPipeline: stage %s degraded: %v", stageID, err)
		}

		if emit != nil {
			emit(StageEvent{
				AnalysisID: analysisID,
				Stage:      stageID,
				Name:       stageName,
				Status:     status,
				Message:    msg,
				Timestamp:  endTime,
				DurationMs: duration,
			})
		}

		methodology = append(methodology, contract.MethodologyStep{
			Stage:      stageID,
			Name:       stageName,
			Status:     string(status),
			DurationMs: duration,
		})

		return nil
	}

	// 0. parse_resume
	if err := runStage(0, "parse_resume", "Parsing resume", func() error {
		vars := map[string]interface{}{
			"ResumeText":          cand.ResumeText,
			"CandidateNotes":      cand.Notes,
			"ForbiddenVocabulary": forbiddenStr,
		}
		prompt, err := renderPrompt(resumeEvidencePrompt, vars)
		if err != nil {
			resumeClaims = fallbackResumeEvidence(cand)
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.fastClient.Generate(ctx, prompt)
		if err != nil {
			resumeClaims = fallbackResumeEvidence(cand)
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &resumeClaims); err != nil {
			resumeClaims = fallbackResumeEvidence(cand)
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}

		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// 1. job_profile
	if err := runStage(1, "job_profile", "Extracting role maturity profile", func() error {
		vars := map[string]interface{}{
			"JobDescription":      job.Description,
			"Seniority":           string(job.Seniority),
			"PrimaryStacks":       strings.Join(job.PrimaryStacks, ", "),
			"JobNotes":            job.Notes,
			"ForbiddenVocabulary": forbiddenStr,
		}
		prompt, err := renderPrompt(jobProfilePrompt, vars)
		if err != nil {
			jobProfile = fallbackJobProfile(job)
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.fastClient.Generate(ctx, prompt)
		if err != nil {
			jobProfile = fallbackJobProfile(job)
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &jobProfile); err != nil {
			jobProfile = fallbackJobProfile(job)
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}

		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// 2. linkedin_evidence (mocked in Tier 2)
	if err := runStage(2, "linkedin_evidence", "Reading LinkedIn evidence", func() error {
		time.Sleep(50 * time.Millisecond)
		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// 3. github_evidence
	if err := runStage(3, "github_evidence", "Analyzing GitHub repositories", func() error {
		ev, err := gp.fetchGitHubEvidence(ctx, cand.GithubURL)
		githubEvidence = ev
		return err
	}); err != nil {
		return contract.Report{}, err
	}

	// 4. portfolio_evidence
	if err := runStage(4, "portfolio_evidence", "Reading portfolio signals", func() error {
		ev, err := gp.fetchPortfolioEvidence(ctx, cand.PortfolioURL)
		portfolioEvidence = ev
		return err
	}); err != nil {
		return contract.Report{}, err
	}

	// 5. evidence_checker
	if err := runStage(5, "evidence_checker", "Checking claims against evidence", func() error {
		jobProfileJSON, _ := json.Marshal(jobProfile)
		vars := map[string]interface{}{
			"JobProfile":           string(jobProfileJSON),
			"ResumeText":           cand.ResumeText,
			"CandidateNotes":       cand.Notes,
			"LinkedinText":         cand.LinkedinText,
			"GithubURL":            cand.GithubURL,
			"PortfolioURL":         cand.PortfolioURL,
			"ExternalEvidenceJSON": buildExternalEvidenceJSON(cand, githubEvidence, portfolioEvidence),
			"ForbiddenVocabulary":  forbiddenStr,
		}
		prompt, err := renderPrompt(evidenceCheckerPrompt, vars)
		if err != nil {
			checkedSkills = fallbackEvidenceChecker(job, cand)
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.strongClient.Generate(ctx, prompt)
		if err != nil {
			checkedSkills = fallbackEvidenceChecker(job, cand)
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &checkedSkills); err != nil {
			checkedSkills = fallbackEvidenceChecker(job, cand)
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}
		return nil
	}); err != nil {
		return contract.Report{}, err
	}
	sanitizeCheckedSkills(&checkedSkills, externalSourcesByKind(githubEvidence, portfolioEvidence))

	// 6. evidence_matrix
	if err := runStage(6, "evidence_matrix", "Building evidence matrix", func() error {
		checkedSkillsJSON, _ := json.Marshal(checkedSkills)
		vars := map[string]interface{}{
			"CheckedSkills":       string(checkedSkillsJSON),
			"ForbiddenVocabulary": forbiddenStr,
		}
		prompt, err := renderPrompt(quadrantClassifierPrompt, vars)
		if err != nil {
			matrix = fallbackQuadrantClassifier(job, cand)
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.strongClient.Generate(ctx, prompt)
		if err != nil {
			matrix = fallbackQuadrantClassifier(job, cand)
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &matrix); err != nil {
			matrix = fallbackQuadrantClassifier(job, cand)
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}
		return nil
	}); err != nil {
		return contract.Report{}, err
	}
	sanitizeQuadrantClassifier(&matrix, externalSourcesByKind(githubEvidence, portfolioEvidence))

	// 7. star_questions
	if err := runStage(7, "star_questions", "Generating STAR questions", func() error {
		jobProfileJSON, _ := json.Marshal(jobProfile)
		matrixJSON, _ := json.Marshal(matrix)
		vars := map[string]interface{}{
			"JobProfile":          string(jobProfileJSON),
			"EvidenceMatrix":      string(matrixJSON),
			"ForbiddenVocabulary": forbiddenStr,
		}
		prompt, err := renderPrompt(starQuestionsPrompt, vars)
		if err != nil {
			starQs = fallbackSTARQuestions()
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.strongClient.Generate(ctx, prompt)
		if err != nil {
			starQs = fallbackSTARQuestions()
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &starQs); err != nil {
			starQs = fallbackSTARQuestions()
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}

		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// 8. analyst_review
	if err := runStage(8, "analyst_review", "Running analyst self-review", func() error {
		jobProfileJSON, _ := json.Marshal(jobProfile)
		matrixJSON, _ := json.Marshal(matrix)
		starQsJSON, _ := json.Marshal(starQs)
		vars := map[string]interface{}{
			"JobProfile":          string(jobProfileJSON),
			"EvidenceMatrix":      string(matrixJSON),
			"STARQuestions":       string(starQsJSON),
			"Seniority":           string(job.Seniority),
			"ForbiddenVocabulary": forbiddenStr,
		}
		prompt, err := renderPrompt(analystReviewPrompt, vars)
		if err != nil {
			review = fallbackAnalystReview(job, matrix)
			return fmt.Errorf("failed to render prompt: %w", err)
		}

		resp, err := gp.strongClient.Generate(ctx, prompt)
		if err != nil {
			review = fallbackAnalystReview(job, matrix)
			return fmt.Errorf("LLM error: %w", err)
		}

		if err := json.Unmarshal([]byte(cleanJSON(resp)), &review); err != nil {
			review = fallbackAnalystReview(job, matrix)
			return fmt.Errorf("JSON parse error: %w (raw response: %s)", err, resp)
		}

		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// 9. finalize
	if err := runStage(9, "finalize", "Finalizing report", func() error {
		time.Sleep(50 * time.Millisecond)
		return nil
	}); err != nil {
		return contract.Report{}, err
	}

	// Build the final report
	finalLimitations := []string{
		"Analysis is based only on the public evidence and text provided.",
		"Absence of public evidence is treated as a question for the interview, not as a conclusion about the candidate.",
	}
	finalLimitations = append(finalLimitations, review.Limitations...)
	if degraded {
		finalLimitations = append(finalLimitations,
			"Some analysis stages used a conservative fallback; results remain evidence-based and uncertainty-preserving.")
	}

	// Clean duplicates from limitations
	finalLimitations = uniqueStrings(finalLimitations)

	// Ensure confirmedStrengths and other lists are not nil
	if matrix.ConfirmedStrengths == nil {
		matrix.ConfirmedStrengths = []contract.Finding{}
	}
	if matrix.ConfirmedGaps == nil {
		matrix.ConfirmedGaps = []contract.Finding{}
	}
	if matrix.StrengthsNeedingValidation == nil {
		matrix.StrengthsNeedingValidation = []contract.ValidationItem{}
	}
	if matrix.WeakSignalsNeedingValidation == nil {
		matrix.WeakSignalsNeedingValidation = []contract.ValidationItem{}
	}
	if matrix.EvidenceMatrix == nil {
		matrix.EvidenceMatrix = []contract.QuadrantItem{}
	}
	if starQs.StarQuestions == nil {
		starQs.StarQuestions = []contract.STARQuestion{}
	}

	report := contract.Report{
		Seniority:                    job.Seniority, // Mandatory policy: must echo job seniority
		ExecutiveSummary:             review.ExecutiveSummary,
		Badges:                       review.Badges,
		EvidenceMatrix:               matrix.EvidenceMatrix,
		ConfirmedStrengths:           matrix.ConfirmedStrengths,
		StrengthsNeedingValidation:   matrix.StrengthsNeedingValidation,
		ConfirmedGaps:                matrix.ConfirmedGaps,
		WeakSignalsNeedingValidation: matrix.WeakSignalsNeedingValidation,
		STARQuestions:                starQs.StarQuestions,
		RecruiterSummary:             review.RecruiterSummary,
		HiringManagerSummary:         review.HiringManagerSummary,
		Methodology:                  methodology,
		Limitations:                  finalLimitations,
	}

	// Post-generation policy self-heal. The runner rejects any non-compliant
	// report, so guarantee compliance here rather than failing the whole
	// analysis on a single stray LLM output (spec 006 AC2/AC5). If the
	// assembled, LLM-driven report violates policy, fall back to the
	// deterministic baseline (guaranteed compliant) while preserving the real
	// stage timeline.
	if vs := eval.Validate(report, job.Seniority); len(vs) > 0 {
		log.Printf("GeminiPipeline: assembled report failed policy (%d violation(s)); using deterministic baseline: %v", len(vs), vs)
		report = buildReport(job, cand, methodology)
		report.Limitations = uniqueStrings(append(report.Limitations,
			"The automated analysis was replaced with a conservative baseline to satisfy evidence and language policies."))
	}

	return report, nil
}

func (gp *GeminiPipeline) fetchGitHubEvidence(ctx context.Context, rawURL string) (ingestgithub.Evidence, error) {
	if strings.TrimSpace(rawURL) == "" {
		return ingestgithub.Evidence{}, nil
	}
	ev, err := gp.githubFetch(ctx, rawURL, gp.githubToken)
	if err != nil {
		ev.Degraded = true
		return ev, errors.New("github evidence ingestion failed")
	}
	if ev.Degraded {
		return ev, fmt.Errorf("github evidence ingestion degraded")
	}
	if len(ev.Sources) == 0 {
		ev.Degraded = true
		return ev, fmt.Errorf("github evidence ingestion returned no public sources")
	}
	return ev, nil
}

func (gp *GeminiPipeline) fetchPortfolioEvidence(ctx context.Context, rawURL string) (ingestportfolio.Evidence, error) {
	if strings.TrimSpace(rawURL) == "" {
		return ingestportfolio.Evidence{}, nil
	}
	ev, err := gp.portfolioFetch(ctx, rawURL, gp.portfolioOptions)
	if err != nil {
		ev.Degraded = true
		return ev, errors.New("portfolio evidence ingestion failed")
	}
	if ev.Degraded {
		return ev, fmt.Errorf("portfolio evidence ingestion degraded")
	}
	if len(ev.Sources) == 0 {
		ev.Degraded = true
		return ev, fmt.Errorf("portfolio evidence ingestion returned no public sources")
	}
	return ev, nil
}

func buildExternalEvidenceJSON(cand contract.CandidateInput, githubEvidence ingestgithub.Evidence, portfolioEvidence ingestportfolio.Evidence) string {
	payload := externalEvidenceContext{
		GitHub: githubEvidencePrompt{
			Provided:       strings.TrimSpace(cand.GithubURL) != "",
			Degraded:       githubEvidence.Degraded,
			Sources:        nonNilSources(githubEvidence.Sources),
			Owner:          githubEvidence.Summary.Owner,
			Repositories:   githubRepositoriesForPrompt(githubEvidence.Summary.Repositories),
			Languages:      nonNilStrings(githubEvidence.Summary.Languages),
			Manifests:      nonNilStrings(githubEvidence.Summary.Manifests),
			HasReadme:      githubEvidence.Summary.HasReadme,
			HasCI:          githubEvidence.Summary.HasCI,
			HasTests:       githubEvidence.Summary.HasTests,
			HasDocker:      githubEvidence.Summary.HasDocker,
			RecentActivity: githubEvidence.Summary.RecentActivity,
			LinksChecked:   nonNilStrings(githubEvidence.Summary.GitHubLinksChecked),
		},
		Portfolio: portfolioEvidencePrompt{
			Provided:       strings.TrimSpace(cand.PortfolioURL) != "",
			Degraded:       portfolioEvidence.Degraded,
			Sources:        nonNilSources(portfolioEvidence.Sources),
			URL:            portfolioEvidence.Summary.URL,
			PagesFetched:   nonNilStrings(portfolioEvidence.Summary.PagesFetched),
			GitHubLinks:    nonNilStrings(portfolioEvidence.Summary.GitHubLinks),
			ProjectSignals: nonNilStrings(portfolioEvidence.Summary.ProjectSignals),
		},
	}
	b, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return "{}"
	}
	return string(b)
}

func githubRepositoriesForPrompt(repos []ingestgithub.RepositorySummary) []githubRepositoryPrompt {
	out := make([]githubRepositoryPrompt, 0, len(repos))
	for _, repo := range repos {
		out = append(out, githubRepositoryPrompt{
			FullName:       repo.FullName,
			Languages:      nonNilStrings(repo.Languages),
			Manifests:      nonNilStrings(repo.Manifests),
			HasReadme:      repo.HasReadme,
			HasCI:          repo.HasCI,
			HasTests:       repo.HasTests,
			HasDocker:      repo.HasDocker,
			RecentActivity: repo.RecentActivity,
		})
	}
	return out
}

func nonNilSources(sources []contract.Source) []contract.Source {
	if sources == nil {
		return []contract.Source{}
	}
	return sources
}

func nonNilStrings(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}

func externalSourcesByKind(githubEvidence ingestgithub.Evidence, portfolioEvidence ingestportfolio.Evidence) map[contract.SourceKind][]contract.Source {
	allowed := make(map[contract.SourceKind][]contract.Source, 2)
	for _, source := range githubEvidence.Sources {
		allowed[source.Kind] = appendUniqueSource(allowed[source.Kind], source)
	}
	for _, source := range portfolioEvidence.Sources {
		allowed[source.Kind] = appendUniqueSource(allowed[source.Kind], source)
	}
	return allowed
}

func sanitizeCheckedSkills(out *evidenceCheckerOut, allowed map[contract.SourceKind][]contract.Source) {
	for i := range out.CheckedSkills {
		skill := &out.CheckedSkills[i]
		filtered, _ := filterExternalSources(skill.Sources, allowed)
		skill.Sources = filtered
		switch skill.Status {
		case "confirmed":
			if hasPublicCorroboratingSource(filtered) {
				continue
			}
			if len(filtered) > 0 {
				skill.Status = "plausible"
				skill.Rationale = "The provided candidate text references this skill, but public corroboration is unavailable; validate the claim in the interview."
			} else {
				skill.Status = "unverified"
				skill.Rationale = "The claim is not corroborated by the available public evidence and should be validated in the interview."
			}
		case "plausible":
			if len(filtered) == 0 {
				skill.Status = "unverified"
				skill.Rationale = "The claim is not corroborated by the available public evidence and should be validated in the interview."
			}
		}
	}
}

func sanitizeQuadrantClassifier(out *quadrantClassifierOut, allowed map[contract.SourceKind][]contract.Source) {
	for i := range out.EvidenceMatrix {
		item := &out.EvidenceMatrix[i]
		filtered, removedExternal := filterExternalSources(item.Sources, allowed)
		item.Sources = filtered
		if item.Quadrant.NeedsValidation() {
			item.Sources = []contract.Source{}
			continue
		}
		switch item.Quadrant {
		case contract.QuadrantStrongWithEvidence:
			if hasPublicCorroboratingSource(filtered) {
				continue
			}
			item.Quadrant = contract.QuadrantStrongNeedsValidation
			item.Sources = []contract.Source{}
			item.Rationale = "Public corroboration is unavailable, so this claimed strength requires interview validation."
		case contract.QuadrantWeakWithEvidence:
			if removedExternal && len(filtered) == 0 {
				item.Quadrant = contract.QuadrantWeakNeedsValidation
				item.Sources = []contract.Source{}
				item.Rationale = "The referenced public evidence was unavailable, so no gap can be concluded; validate this area in the interview."
			}
		}
	}

	var confirmedStrengths []contract.Finding
	for _, finding := range out.ConfirmedStrengths {
		filtered, _ := filterExternalSources(finding.Sources, allowed)
		if !hasPublicCorroboratingSource(filtered) {
			out.StrengthsNeedingValidation = append(out.StrengthsNeedingValidation, contract.ValidationItem{
				Statement:      "A claimed strength requires validation because public corroboration is unavailable.",
				InterviewFocus: "Ask the candidate for a concrete example and their specific contribution.",
			})
			continue
		}
		finding.Sources = filtered
		confirmedStrengths = append(confirmedStrengths, finding)
	}
	out.ConfirmedStrengths = confirmedStrengths

	var confirmedGaps []contract.Finding
	for _, finding := range out.ConfirmedGaps {
		filtered, removedExternal := filterExternalSources(finding.Sources, allowed)
		if removedExternal && !hasPublicCorroboratingSource(filtered) {
			out.WeakSignalsNeedingValidation = append(out.WeakSignalsNeedingValidation, contract.ValidationItem{
				Statement:      "A possible weak signal requires validation because the referenced public evidence was unavailable.",
				InterviewFocus: "Ask the candidate to describe their experience in this area before drawing a conclusion.",
			})
			continue
		}
		finding.Sources = filtered
		confirmedGaps = append(confirmedGaps, finding)
	}
	out.ConfirmedGaps = confirmedGaps

	for i := range out.StrengthsNeedingValidation {
		out.StrengthsNeedingValidation[i].Sources, _ = filterExternalSources(out.StrengthsNeedingValidation[i].Sources, allowed)
	}
	for i := range out.WeakSignalsNeedingValidation {
		out.WeakSignalsNeedingValidation[i].Sources, _ = filterExternalSources(out.WeakSignalsNeedingValidation[i].Sources, allowed)
	}
}

func filterExternalSources(sources []contract.Source, allowed map[contract.SourceKind][]contract.Source) ([]contract.Source, bool) {
	filtered := make([]contract.Source, 0, len(sources))
	removedExternal := false
	for _, source := range sources {
		if source.Kind == contract.SourceGitHub || source.Kind == contract.SourcePortfolio {
			canonical := allowed[source.Kind]
			if len(canonical) == 0 {
				removedExternal = true
				continue
			}
			for _, actual := range canonical {
				filtered = appendUniqueSource(filtered, actual)
			}
			continue
		}
		filtered = appendUniqueSource(filtered, source)
	}
	return filtered, removedExternal
}

func appendUniqueSource(sources []contract.Source, source contract.Source) []contract.Source {
	for _, existing := range sources {
		if existing.Kind == source.Kind && existing.Detail == source.Detail {
			return sources
		}
	}
	return append(sources, source)
}

func hasPublicCorroboratingSource(sources []contract.Source) bool {
	for _, source := range sources {
		switch source.Kind {
		case contract.SourceGitHub, contract.SourcePortfolio, contract.SourceLinkedIn:
			return true
		}
	}
	return false
}

// Prompt template rendering helper
func renderPrompt(tmplStr string, data interface{}) (string, error) {
	tmpl, err := template.New("prompt").Parse(tmplStr)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// Helper to strip markdown code blocks around JSON
func cleanJSON(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```") {
		// Find first newline to strip opening block
		if idx := strings.Index(s, "\n"); idx != -1 {
			s = s[idx+1:]
		}
		// Strip closing block
		s = strings.TrimSuffix(s, "```")
		s = strings.TrimSpace(s)
	}
	return s
}

// Helpers for fallbacks (pure Go, matching mock.go structures)
func fallbackResumeEvidence(cand contract.CandidateInput) resumeEvidenceOut {
	return resumeEvidenceOut{
		Skills: []struct {
			Name       string `json:"name"`
			Detail     string `json:"detail"`
			Confidence string `json:"confidence"`
		}{
			{Name: "General Software Engineering", Detail: "Extracted from resume", Confidence: "explicit"},
		},
	}
}

func fallbackJobProfile(job contract.JobInput) jobProfileOut {
	return jobProfileOut{
		PrimaryRequirements:   job.PrimaryStacks,
		DesirableRequirements: job.StackTags,
		SeniorityExpectations: "Expectations for " + string(job.Seniority) + " level role.",
		TechnicalRisks:        []string{},
	}
}

func fallbackEvidenceChecker(job contract.JobInput, cand contract.CandidateInput) evidenceCheckerOut {
	candidateText := strings.ToLower(strings.Join([]string{cand.ResumeText, cand.LinkedinText, cand.Notes}, "\n"))
	hasGitHub := strings.TrimSpace(cand.GithubURL) != ""
	hasResume := strings.TrimSpace(cand.ResumeText) != ""

	out := evidenceCheckerOut{}
	for _, stack := range job.PrimaryStacks {
		claimed := strings.Contains(candidateText, strings.ToLower(stack))
		var status string
		var srcs []contract.Source
		var rationale string

		if claimed && hasGitHub {
			status = "confirmed"
			srcs = []contract.Source{{Kind: contract.SourceGitHub, Detail: "public repositories reference " + stack}}
			if hasResume {
				srcs = append(srcs, contract.Source{Kind: contract.SourceResume, Detail: "resume references " + stack})
			}
			rationale = "Public evidence and the resume both reference " + stack + " work."
		} else if claimed && !hasGitHub {
			status = "plausible"
			rationale = "The resume references " + stack + ", but no public code was provided to corroborate it."
		} else {
			status = "unverified"
			rationale = stack + " is a primary stack for the role but is not publicly evidenced; this is a question for the interview."
		}

		out.CheckedSkills = append(out.CheckedSkills, struct {
			Name      string            `json:"name"`
			Status    string            `json:"status"`
			Rationale string            `json:"rationale"`
			Sources   []contract.Source `json:"sources"`
		}{
			Name:      stack + " practice",
			Status:    status,
			Rationale: rationale,
			Sources:   srcs,
		})
	}
	return out
}

func fallbackQuadrantClassifier(job contract.JobInput, cand contract.CandidateInput) quadrantClassifierOut {
	candidateText := strings.ToLower(strings.Join([]string{cand.ResumeText, cand.LinkedinText, cand.Notes}, "\n"))
	hasGitHub := strings.TrimSpace(cand.GithubURL) != ""
	hasResume := strings.TrimSpace(cand.ResumeText) != ""

	var (
		matrix     []contract.QuadrantItem
		strengths  []contract.Finding
		strengthsV []contract.ValidationItem
	)

	for _, stack := range job.PrimaryStacks {
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
		default:
			matrix = append(matrix, contract.QuadrantItem{
				Title:          stack + " practice",
				Quadrant:       contract.QuadrantWeakNeedsValidation,
				Sources:        nil,
				Rationale:      stack + " is a primary stack for the role but is not publicly evidenced; this is a question for the interview, not a conclusion.",
				InterviewFocus: "Ask how the candidate would approach a task in " + stack + ".",
			})
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
	}

	weakSignals := []contract.ValidationItem{}
	if strings.TrimSpace(cand.GithubURL) == "" {
		weakSignals = append(weakSignals, contract.ValidationItem{
			Statement:      "No public code repository was provided.",
			InterviewFocus: "Ask the candidate to walk through a representative project they built.",
		})
	}
	if strings.TrimSpace(cand.PortfolioURL) == "" {
		weakSignals = append(weakSignals, contract.ValidationItem{
			Statement:      "No portfolio was provided.",
			InterviewFocus: "Ask the candidate to describe a project they are proud of and why.",
		})
	}
	if len(weakSignals) == 0 {
		weakSignals = append(weakSignals, contract.ValidationItem{
			Statement:      "Operational and deployment experience is not fully evidenced.",
			InterviewFocus: "Ask about a time the candidate took a change from commit to production.",
		})
	}

	return quadrantClassifierOut{
		EvidenceMatrix:               matrix,
		ConfirmedStrengths:           strengths,
		StrengthsNeedingValidation:   strengthsV,
		ConfirmedGaps:                []contract.Finding{},
		WeakSignalsNeedingValidation: weakSignals,
	}
}

func fallbackSTARQuestions() starQuestionsOut {
	return starQuestionsOut{
		StarQuestions: []contract.STARQuestion{
			{ID: "star_1", Dimension: "technical depth", Question: "Describe a situation where a technical decision you made had to change. What was the task, what actions did you take, and what was the result?"},
			{ID: "star_2", Dimension: "collaboration", Question: "Tell me about a time you disagreed with a technical decision on your team. How did you handle it and what happened?"},
		},
	}
}

func fallbackAnalystReview(job contract.JobInput, matrix quadrantClassifierOut) analystReviewOut {
	var strongN, validateN int
	for _, it := range matrix.EvidenceMatrix {
		if it.Quadrant.WithEvidence() {
			strongN++
		} else {
			validateN++
		}
	}

	execSummary := fmt.Sprintf(
		"Public evidence suggests a %s-level engineer. %d signal(s) are well evidenced; %d are noted for interview validation rather than treated as conclusions.",
		job.Seniority, strongN, validateN,
	)

	badges := []contract.Badge{{Label: strings.ToUpper(string(job.Seniority)[:1]) + string(job.Seniority)[1:] + " role profile", Tone: "neutral"}}
	if strongN > 0 {
		badges = append(badges, contract.Badge{Label: "Evidenced strengths present", Tone: "positive"})
	}
	if validateN > 0 {
		badges = append(badges, contract.Badge{Label: "Some signals need validation", Tone: "neutral"})
	}

	return analystReviewOut{
		ExecutiveSummary:     execSummary,
		Badges:               badges,
		RecruiterSummary:     "Treat the well-evidenced signals as established and the validation items as interview questions rather than conclusions.",
		HiringManagerSummary: "Evidenced strengths are traceable to public work. Claims without public corroboration are framed as interview-validation items, not conclusions about the candidate.",
		Limitations:          []string{},
	}
}

// Utility to remove duplicates from a string slice
func uniqueStrings(slice []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range slice {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
