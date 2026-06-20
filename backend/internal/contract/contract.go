// Package contract defines and freezes the data contracts every other unit
// depends on: the two inputs (JobInput, CandidateInput), the QuadrantItem, and
// the full structured Report. These mirror PRD §14 and TECHNICAL_DESIGN §5/§6
// 1:1 with the TypeScript types in frontend/src/types/contract.ts. Field names
// are camelCase on the wire so Go and TS share one shape; the frontend renders
// from this JSON, never from the Markdown export.
//
// This is the seam (spec 001): freeze it before building anything else. By
// ADR-0002 there is intentionally no score/rating/fit/percentage field and no
// numeric fit value anywhere — a structural test enforces that.
package contract

// JobInput is the role being hired for (PRD §14).
type JobInput struct {
	Description     string    `json:"description"`
	Seniority       Seniority `json:"seniority"`
	YearsExperience *int      `json:"yearsExperience"` // nullable
	StackTags       []string  `json:"stackTags"`
	PrimaryStacks   []string  `json:"primaryStacks"` // subset of StackTags, max 3
	Notes           string    `json:"notes"`
}

// CandidateInput is the public evidence supplied for the candidate (PRD §14).
type CandidateInput struct {
	ResumeText   string `json:"resumeText"`
	LinkedinText string `json:"linkedinText"`
	GithubURL    string `json:"githubUrl"`
	PortfolioURL string `json:"portfolioUrl"`
	Notes        string `json:"notes"`
}

// Source is a typed reference to where a piece of evidence came from, so
// sourcing checks (EVALUATION L1) can be mechanical.
type Source struct {
	Kind   SourceKind `json:"kind"`
	Detail string     `json:"detail"`
}

// QuadrantItem is one cell of the four-quadrant evidence matrix (PRD §14,
// TECHNICAL_DESIGN §6).
type QuadrantItem struct {
	Title          string   `json:"title"`
	Quadrant       Quadrant `json:"quadrant"`
	Sources        []Source `json:"sources"`
	Rationale      string   `json:"rationale"`
	InterviewFocus string   `json:"interviewFocus"`
	STARRefs       []string `json:"starRefs,omitempty"`
}

// Finding is a confirmed strength or confirmed gap: a conclusion that, because
// it is asserted, must cite ≥1 source (EVALUATION L1).
type Finding struct {
	Statement string   `json:"statement"`
	Sources   []Source `json:"sources"`
}

// ValidationItem is a not-yet-confirmed signal that surfaces as an interview
// question rather than a conclusion. Sources are optional here.
type ValidationItem struct {
	Statement      string   `json:"statement"`
	InterviewFocus string   `json:"interviewFocus"`
	Sources        []Source `json:"sources,omitempty"`
}

// Badge is a qualitative label (never a numeric score).
type Badge struct {
	Label string `json:"label"`
	Tone  string `json:"tone"`
}

// STARQuestion is an investigable, non-accusatory interview question.
type STARQuestion struct {
	ID        string `json:"id"`
	Dimension string `json:"dimension"`
	Question  string `json:"question"`
}

// MethodologyStep is one entry of the analysis timeline, built from the SSE
// stage history (TECHNICAL_DESIGN §4/§5).
type MethodologyStep struct {
	Stage      string `json:"stage"`
	Name       string `json:"name"`
	Status     string `json:"status"`
	DurationMs int64  `json:"durationMs,omitempty"`
}

// Report is the full structured analysis output. Every section in
// TECHNICAL_DESIGN §5 is a required field; the report cannot be constructed
// missing a section (spec 001 AC4, enforced by Validate). There is deliberately
// no numeric verdict anywhere (ADR-0002).
type Report struct {
	Seniority                    Seniority         `json:"seniority"` // echoed from JobInput (L1)
	ExecutiveSummary             string            `json:"executiveSummary"`
	Badges                       []Badge           `json:"badges"`
	EvidenceMatrix               []QuadrantItem    `json:"evidenceMatrix"`
	ConfirmedStrengths           []Finding         `json:"confirmedStrengths"`
	StrengthsNeedingValidation   []ValidationItem  `json:"strengthsNeedingValidation"`
	ConfirmedGaps                []Finding         `json:"confirmedGaps"`
	WeakSignalsNeedingValidation []ValidationItem  `json:"weakSignalsNeedingValidation"`
	STARQuestions                []STARQuestion    `json:"starQuestions"`
	RecruiterSummary             string            `json:"recruiterSummary"`
	HiringManagerSummary         string            `json:"hiringManagerSummary"`
	Methodology                  []MethodologyStep `json:"methodology"`
	Limitations                  []string          `json:"limitations"`
}
