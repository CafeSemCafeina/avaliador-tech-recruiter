package contract

import (
	"encoding/json"
	"fmt"
)

// Seniority is the role seniority echoed end to end. The enum is fixed by
// PRD §14 and must never be invented by the analysis (EVALUATION L1).
type Seniority string

const (
	SeniorityIntern Seniority = "intern"
	SeniorityJunior Seniority = "junior"
	SeniorityMid    Seniority = "mid"
	SenioritySenior Seniority = "senior"
	SeniorityStaff  Seniority = "staff"
)

// Valid reports whether s is one of the five allowed seniority values.
func (s Seniority) Valid() bool {
	switch s {
	case SeniorityIntern, SeniorityJunior, SeniorityMid, SenioritySenior, SeniorityStaff:
		return true
	}
	return false
}

// UnmarshalJSON rejects any value outside the fixed enum so an invalid
// seniority fails to deserialize (spec 001 AC5).
func (s *Seniority) UnmarshalJSON(b []byte) error {
	var raw string
	if err := json.Unmarshal(b, &raw); err != nil {
		return err
	}
	v := Seniority(raw)
	if !v.Valid() {
		return fmt.Errorf("contract: invalid seniority %q", raw)
	}
	*s = v
	return nil
}

// Quadrant is the evidence-matrix classification (PRD §14, TECHNICAL_DESIGN §6).
type Quadrant string

const (
	QuadrantStrongWithEvidence    Quadrant = "strong_with_evidence"
	QuadrantStrongNeedsValidation Quadrant = "strong_needs_validation"
	QuadrantWeakWithEvidence      Quadrant = "weak_with_evidence"
	QuadrantWeakNeedsValidation   Quadrant = "weak_needs_validation"
)

// Valid reports whether q is one of the four allowed quadrant values.
func (q Quadrant) Valid() bool {
	switch q {
	case QuadrantStrongWithEvidence, QuadrantStrongNeedsValidation,
		QuadrantWeakWithEvidence, QuadrantWeakNeedsValidation:
		return true
	}
	return false
}

// WithEvidence reports whether the quadrant asserts a concrete, sourced
// conclusion (and therefore requires ≥1 source under EVALUATION L1).
func (q Quadrant) WithEvidence() bool {
	return q == QuadrantStrongWithEvidence || q == QuadrantWeakWithEvidence
}

// NeedsValidation reports whether the quadrant is a not-yet-confirmed signal
// that must surface as an interview-validation item, never as a gap.
func (q Quadrant) NeedsValidation() bool {
	return q == QuadrantStrongNeedsValidation || q == QuadrantWeakNeedsValidation
}

// UnmarshalJSON rejects any value outside the fixed enum so an invalid
// quadrant fails to deserialize (spec 001 AC3).
func (q *Quadrant) UnmarshalJSON(b []byte) error {
	var raw string
	if err := json.Unmarshal(b, &raw); err != nil {
		return err
	}
	v := Quadrant(raw)
	if !v.Valid() {
		return fmt.Errorf("contract: invalid quadrant %q", raw)
	}
	*q = v
	return nil
}

// SourceKind is the typed origin of a piece of evidence so L1 sourcing checks
// can be mechanical (spec 001 technical context).
type SourceKind string

const (
	SourceResume    SourceKind = "resume"
	SourceGitHub    SourceKind = "github"
	SourceLinkedIn  SourceKind = "linkedin"
	SourcePortfolio SourceKind = "portfolio"
	SourceJob       SourceKind = "job"
)

// Valid reports whether k is one of the allowed source kinds.
func (k SourceKind) Valid() bool {
	switch k {
	case SourceResume, SourceGitHub, SourceLinkedIn, SourcePortfolio, SourceJob:
		return true
	}
	return false
}

// UnmarshalJSON rejects any value outside the fixed enum.
func (k *SourceKind) UnmarshalJSON(b []byte) error {
	var raw string
	if err := json.Unmarshal(b, &raw); err != nil {
		return err
	}
	v := SourceKind(raw)
	if !v.Valid() {
		return fmt.Errorf("contract: invalid source kind %q", raw)
	}
	*k = v
	return nil
}
