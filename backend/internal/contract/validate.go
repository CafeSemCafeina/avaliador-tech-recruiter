package contract

import (
	"errors"
	"fmt"
	"strings"
)

// Validate checks that every TECHNICAL_DESIGN §5 section is present and that the
// embedded enums are valid. Go cannot make struct fields required at compile
// time, so this is how the "a Report cannot be missing a section" rule (spec
// 001 AC4) is enforced. It is a structural (L0) check only — it does not apply
// the output policy (that is the eval package, spec 004).
func (r Report) Validate() error {
	var missing []string
	require := func(name string, empty bool) {
		if empty {
			missing = append(missing, name)
		}
	}

	require("seniority", r.Seniority == "")
	require("executiveSummary", strings.TrimSpace(r.ExecutiveSummary) == "")
	require("badges", len(r.Badges) == 0)
	require("evidenceMatrix", len(r.EvidenceMatrix) == 0)
	require("confirmedStrengths", r.ConfirmedStrengths == nil)
	require("strengthsNeedingValidation", r.StrengthsNeedingValidation == nil)
	require("confirmedGaps", r.ConfirmedGaps == nil)
	require("weakSignalsNeedingValidation", r.WeakSignalsNeedingValidation == nil)
	require("starQuestions", len(r.STARQuestions) == 0)
	require("recruiterSummary", strings.TrimSpace(r.RecruiterSummary) == "")
	require("hiringManagerSummary", strings.TrimSpace(r.HiringManagerSummary) == "")
	require("methodology", len(r.Methodology) == 0)
	require("limitations", len(r.Limitations) == 0)

	if len(missing) > 0 {
		return fmt.Errorf("contract: report missing required sections: %s", strings.Join(missing, ", "))
	}

	if !r.Seniority.Valid() {
		return fmt.Errorf("contract: invalid seniority %q", r.Seniority)
	}
	for i, it := range r.EvidenceMatrix {
		if err := it.Validate(); err != nil {
			return fmt.Errorf("contract: evidenceMatrix[%d]: %w", i, err)
		}
	}
	return nil
}

// Validate checks a single matrix item is structurally complete with a valid
// quadrant enum (spec 001 AC3). Sourcing/policy rules live in the eval package.
func (it QuadrantItem) Validate() error {
	if strings.TrimSpace(it.Title) == "" {
		return errors.New("missing title")
	}
	if !it.Quadrant.Valid() {
		return fmt.Errorf("invalid quadrant %q", it.Quadrant)
	}
	if strings.TrimSpace(it.Rationale) == "" {
		return errors.New("missing rationale")
	}
	if strings.TrimSpace(it.InterviewFocus) == "" {
		return errors.New("missing interviewFocus")
	}
	return nil
}
