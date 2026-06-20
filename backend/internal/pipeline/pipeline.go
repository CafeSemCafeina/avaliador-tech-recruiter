// Package pipeline defines the controlled, ordered analysis pipeline as an
// interface plus a deterministic mock implementation (ADR-0003, ADR-0011). The
// runner (api package) depends only on the Pipeline interface and consumes the
// StageEvent values it emits; the gemini implementation (Tier 2) plugs into the
// same interface behind LLMClient. The mock makes no external calls and is the
// protected Tier 1 floor.
package pipeline

import (
	"context"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

// StageStatus is the lifecycle of a single progress stage.
type StageStatus string

const (
	StagePending   StageStatus = "pending"
	StageRunning   StageStatus = "running"
	StageCompleted StageStatus = "completed"
	StageWarning   StageStatus = "warning"
	StageFailed    StageStatus = "failed"
)

// StageEvent is one progress event streamed over SSE (TECHNICAL_DESIGN §4).
type StageEvent struct {
	AnalysisID string      `json:"analysisId"`
	Stage      string      `json:"stage"`
	Name       string      `json:"name"`
	Status     StageStatus `json:"status"`
	Message    string      `json:"message"`
	Timestamp  time.Time   `json:"timestamp"`
	DurationMs int64       `json:"durationMs,omitempty"`
	Error      string      `json:"error,omitempty"`
}

// Stage is one step of the progress UI (PRD §8 step 3). The id is the stable
// machine identifier; the name is the human-facing progress label.
type Stage struct {
	ID   string
	Name string
}

// Stages is the fixed, ordered sequence of the ten progress stages shown to the
// user. The nine agents (PRD §11) map onto these stages; the order never
// changes (ADR-0003: a controlled pipeline, not an autonomous agent).
var Stages = []Stage{
	{ID: "parse_resume", Name: "Parsing resume"},
	{ID: "job_profile", Name: "Extracting role maturity profile"},
	{ID: "linkedin_evidence", Name: "Reading LinkedIn evidence"},
	{ID: "github_evidence", Name: "Analyzing GitHub repositories"},
	{ID: "portfolio_evidence", Name: "Reading portfolio signals"},
	{ID: "evidence_checker", Name: "Checking claims against evidence"},
	{ID: "evidence_matrix", Name: "Building evidence matrix"},
	{ID: "star_questions", Name: "Generating STAR questions"},
	{ID: "analyst_review", Name: "Running analyst self-review"},
	{ID: "finalize", Name: "Finalizing report"},
}

// EmitFunc receives each StageEvent as the pipeline progresses.
type EmitFunc func(StageEvent)

// Pipeline runs the ordered analysis. Implementations must emit the ten stages
// in order and return a Report valid against the contract. The runner depends
// only on this interface.
type Pipeline interface {
	Run(ctx context.Context, analysisID string, job contract.JobInput, cand contract.CandidateInput, emit EmitFunc) (contract.Report, error)
}
