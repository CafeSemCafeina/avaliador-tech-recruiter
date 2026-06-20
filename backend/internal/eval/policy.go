// Package eval implements the executable output policy (EVALUATION L0/L1, spec
// 004): the machine-enforced form of the no-score identity (ADR-0002) and the
// analyst self-check (PRD §11.9). Validate runs in the request path (the runner
// fails an analysis on any violation, so a non-compliant report is never
// served) and in CI. It depends only on the contract types.
package eval

import (
	"bufio"
	_ "embed"
	"fmt"
	"regexp"
	"strings"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

//go:embed forbidden_vocabulary.txt
var forbiddenVocabularyFile string

// Rule identifiers for structured violations.
const (
	RuleForbiddenVocabulary = "forbidden_vocabulary"
	RuleNoScore             = "no_score"
	RuleSourcing            = "sourcing"
	RuleMissingEvidence     = "missing_evidence_is_not_a_gap"
	RuleSeniorityEcho       = "seniority_echo"
	RuleDemographic         = "no_demographic_inference"
)

// Violation is a single policy failure with enough context to locate and fix it.
type Violation struct {
	Path      string `json:"path"`
	Rule      string `json:"rule"`
	Offending string `json:"offending"`
}

func (v Violation) String() string {
	return fmt.Sprintf("%s [%s]: %s", v.Path, v.Rule, v.Offending)
}

// ForbiddenVocabulary returns the canonical forbidden terms, parsed from the
// single embedded source file.
func ForbiddenVocabulary() []string {
	var terms []string
	sc := bufio.NewScanner(strings.NewReader(forbiddenVocabularyFile))
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		terms = append(terms, line)
	}
	return terms
}

var (
	forbiddenRes  = compileWordRegexes(ForbiddenVocabulary())
	noScoreRe     = regexp.MustCompile(`(?i)\b(score|rating|fit|percentage)\b`)
	numericFitRes = []*regexp.Regexp{
		regexp.MustCompile(`\b\d{1,3}\s*%`),
		regexp.MustCompile(`(?i)\b\d{1,3}\s*(?:/|out of)\s*(?:100|10|5)\b`),
	}
	demographicRe = regexp.MustCompile(`(?i)\b(age|aged|gender|male|female|man|woman|men|women|ethnicity|ethnic|race|racial|nationality|national origin|religion|religious|married|marital|pregnant|disability|disabled)\b`)
)

func compileWordRegexes(terms []string) []*regexp.Regexp {
	res := make([]*regexp.Regexp, 0, len(terms))
	for _, t := range terms {
		res = append(res, regexp.MustCompile(`(?i)\b`+regexp.QuoteMeta(t)+`\b`))
	}
	return res
}

// Validate applies the full output policy to a report and returns every
// violation found. An empty result means the report is compliant. expected is
// the JobInput.seniority the report must echo (EVALUATION L1).
func Validate(r contract.Report, expected contract.Seniority) []Violation {
	var vs []Violation

	// Rules 1, 2, 5: scan every text field.
	for _, ft := range collectText(r) {
		vs = append(vs, scanText(ft.path, ft.text)...)
	}

	// Seniority echo (AC5).
	if expected != "" && r.Seniority != expected {
		vs = append(vs, Violation{Path: "seniority", Rule: RuleSeniorityEcho,
			Offending: fmt.Sprintf("report seniority %q does not echo job seniority %q", r.Seniority, expected)})
	}

	// Sourcing + missing-evidence rules over the matrix (AC3, AC4).
	for i, it := range r.EvidenceMatrix {
		path := fmt.Sprintf("evidenceMatrix[%d]", i)
		if it.Quadrant.WithEvidence() && len(it.Sources) == 0 {
			rule := RuleSourcing
			if it.Quadrant == contract.QuadrantWeakWithEvidence {
				rule = RuleMissingEvidence
			}
			vs = append(vs, Violation{Path: path, Rule: rule,
				Offending: fmt.Sprintf("%q is %s but has no sources", it.Title, it.Quadrant)})
		}
	}

	// Confirmed conclusions must be sourced (AC4).
	for i, f := range r.ConfirmedStrengths {
		if len(f.Sources) == 0 {
			vs = append(vs, Violation{Path: fmt.Sprintf("confirmedStrengths[%d]", i), Rule: RuleSourcing,
				Offending: "confirmed strength has no sources"})
		}
	}
	for i, f := range r.ConfirmedGaps {
		if len(f.Sources) == 0 {
			vs = append(vs, Violation{Path: fmt.Sprintf("confirmedGaps[%d]", i), Rule: RuleSourcing,
				Offending: "confirmed gap has no sources"})
		}
	}

	return vs
}

// scanText applies the vocabulary, no-score, numeric-fit, and demographic
// scans to one text field.
func scanText(path, text string) []Violation {
	var vs []Violation
	if strings.TrimSpace(text) == "" {
		return vs
	}
	for _, re := range forbiddenRes {
		if m := re.FindString(text); m != "" {
			vs = append(vs, Violation{Path: path, Rule: RuleForbiddenVocabulary, Offending: m})
		}
	}
	if m := noScoreRe.FindString(text); m != "" {
		vs = append(vs, Violation{Path: path, Rule: RuleNoScore, Offending: m})
	}
	for _, re := range numericFitRes {
		if m := re.FindString(text); m != "" {
			vs = append(vs, Violation{Path: path, Rule: RuleNoScore, Offending: m})
		}
	}
	if m := demographicRe.FindString(text); m != "" {
		vs = append(vs, Violation{Path: path, Rule: RuleDemographic, Offending: m})
	}
	return vs
}

type fieldText struct {
	path string
	text string
}

// collectText enumerates every human-readable string in the report with a
// locating path, so scans report exactly where a violation lives.
func collectText(r contract.Report) []fieldText {
	var out []fieldText
	add := func(p, t string) { out = append(out, fieldText{p, t}) }

	add("executiveSummary", r.ExecutiveSummary)
	add("recruiterSummary", r.RecruiterSummary)
	add("hiringManagerSummary", r.HiringManagerSummary)
	for i, b := range r.Badges {
		add(fmt.Sprintf("badges[%d].label", i), b.Label)
	}
	for i, it := range r.EvidenceMatrix {
		p := fmt.Sprintf("evidenceMatrix[%d]", i)
		add(p+".title", it.Title)
		add(p+".rationale", it.Rationale)
		add(p+".interviewFocus", it.InterviewFocus)
		for j, s := range it.Sources {
			add(fmt.Sprintf("%s.sources[%d].detail", p, j), s.Detail)
		}
	}
	addFinding := func(group string, fs []contract.Finding) {
		for i, f := range fs {
			add(fmt.Sprintf("%s[%d].statement", group, i), f.Statement)
			for j, s := range f.Sources {
				add(fmt.Sprintf("%s[%d].sources[%d].detail", group, i, j), s.Detail)
			}
		}
	}
	addFinding("confirmedStrengths", r.ConfirmedStrengths)
	addFinding("confirmedGaps", r.ConfirmedGaps)
	addValidation := func(group string, vs []contract.ValidationItem) {
		for i, v := range vs {
			add(fmt.Sprintf("%s[%d].statement", group, i), v.Statement)
			add(fmt.Sprintf("%s[%d].interviewFocus", group, i), v.InterviewFocus)
			for j, s := range v.Sources {
				add(fmt.Sprintf("%s[%d].sources[%d].detail", group, i, j), s.Detail)
			}
		}
	}
	addValidation("strengthsNeedingValidation", r.StrengthsNeedingValidation)
	addValidation("weakSignalsNeedingValidation", r.WeakSignalsNeedingValidation)
	for i, q := range r.STARQuestions {
		add(fmt.Sprintf("starQuestions[%d].dimension", i), q.Dimension)
		add(fmt.Sprintf("starQuestions[%d].question", i), q.Question)
	}
	for i, m := range r.Methodology {
		add(fmt.Sprintf("methodology[%d].name", i), m.Name)
	}
	for i, l := range r.Limitations {
		add(fmt.Sprintf("limitations[%d]", i), l)
	}
	return out
}
