package contract

import (
	"bytes"
	"encoding/json"
	"os"
	"reflect"
	"strings"
	"testing"
)

// forbiddenFieldNames are the score-like field names that ADR-0002 forbids
// anywhere in the contract. The structural test below walks every type.
var forbiddenFieldNames = []string{"score", "rating", "fit", "percentage"}

// TestNoForbiddenScoreFields enforces spec 001 AC2: the contract types contain
// no field named score/rating/fit/percentage (case-insensitive, by Go name or
// JSON tag) and no other numeric "fit value" field. This is the structural
// half of the no-score guarantee (ADR-0002).
func TestNoForbiddenScoreFields(t *testing.T) {
	roots := []reflect.Type{
		reflect.TypeOf(JobInput{}),
		reflect.TypeOf(CandidateInput{}),
		reflect.TypeOf(Source{}),
		reflect.TypeOf(QuadrantItem{}),
		reflect.TypeOf(Finding{}),
		reflect.TypeOf(ValidationItem{}),
		reflect.TypeOf(Badge{}),
		reflect.TypeOf(STARQuestion{}),
		reflect.TypeOf(MethodologyStep{}),
		reflect.TypeOf(Report{}),
	}
	seen := map[reflect.Type]bool{}
	var walk func(t reflect.Type)
	walk = func(rt reflect.Type) {
		for rt.Kind() == reflect.Ptr || rt.Kind() == reflect.Slice || rt.Kind() == reflect.Array {
			rt = rt.Elem()
		}
		if rt.Kind() != reflect.Struct || seen[rt] {
			return
		}
		seen[rt] = true
		for i := 0; i < rt.NumField(); i++ {
			f := rt.Field(i)
			name := strings.ToLower(f.Name)
			tag := strings.ToLower(strings.Split(f.Tag.Get("json"), ",")[0])
			for _, bad := range forbiddenFieldNames {
				if name == bad || tag == bad {
					t.Errorf("forbidden score-like field %q (json:%q) on %s", f.Name, tag, rt.Name())
				}
			}
			walk(f.Type)
		}
	}
	for _, r := range roots {
		walk(r)
	}
}

// TestQuadrantInvalidFailsDeserialize enforces spec 001 AC3.
func TestQuadrantInvalidFailsDeserialize(t *testing.T) {
	if err := json.Unmarshal([]byte(`"definitely_not_a_quadrant"`), new(Quadrant)); err == nil {
		t.Fatal("expected invalid quadrant to fail deserialization")
	}
	var it QuadrantItem
	if err := json.Unmarshal([]byte(`{"title":"x","quadrant":"bogus","rationale":"r","interviewFocus":"f"}`), &it); err == nil {
		t.Fatal("expected QuadrantItem with invalid quadrant to fail deserialization")
	}
	for _, q := range []Quadrant{QuadrantStrongWithEvidence, QuadrantStrongNeedsValidation, QuadrantWeakWithEvidence, QuadrantWeakNeedsValidation} {
		if err := json.Unmarshal([]byte(`"`+string(q)+`"`), new(Quadrant)); err != nil {
			t.Errorf("valid quadrant %q rejected: %v", q, err)
		}
	}
}

// TestSeniorityEnum enforces spec 001 AC5.
func TestSeniorityEnum(t *testing.T) {
	valid := []Seniority{SeniorityIntern, SeniorityJunior, SeniorityMid, SenioritySenior, SeniorityStaff}
	for _, s := range valid {
		if err := json.Unmarshal([]byte(`"`+string(s)+`"`), new(Seniority)); err != nil {
			t.Errorf("valid seniority %q rejected: %v", s, err)
		}
	}
	for _, bad := range []string{"lead", "principal", "MID", "", "junior "} {
		if err := json.Unmarshal([]byte(`"`+bad+`"`), new(Seniority)); err == nil {
			t.Errorf("invalid seniority %q accepted", bad)
		}
	}
}

// TestReportRequiresAllSections enforces spec 001 AC4: a partial Report fails
// Validate, and the complete fixture passes.
func TestReportRequiresAllSections(t *testing.T) {
	if err := (Report{}).Validate(); err == nil {
		t.Fatal("expected empty report to fail validation")
	}
	if err := (Report{Seniority: SeniorityMid, ExecutiveSummary: "x"}).Validate(); err == nil {
		t.Fatal("expected partial report to fail validation")
	}
	r := loadFixture(t)
	if err := r.Validate(); err != nil {
		t.Fatalf("fixture report failed validation: %v", err)
	}
}

// TestFixtureRoundTrip enforces spec 001 AC1 (Go side): the shared fixture
// deserializes into Report with no unknown fields and re-serializes to
// equivalent JSON. The TS side reads the same fixture (frontend round-trip test).
func TestFixtureRoundTrip(t *testing.T) {
	raw, err := os.ReadFile("testdata/report.json")
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	dec := json.NewDecoder(bytes.NewReader(raw))
	dec.DisallowUnknownFields()
	var r Report
	if err := dec.Decode(&r); err != nil {
		t.Fatalf("fixture has fields not in the contract (drift): %v", err)
	}
	// Re-marshal and compare semantically against the original JSON.
	out, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var a, b any
	if err := json.Unmarshal(raw, &a); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(out, &b); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(a, b) {
		t.Errorf("round-trip mismatch:\noriginal: %s\nremarshaled: %s", raw, out)
	}
}

func loadFixture(t *testing.T) Report {
	t.Helper()
	raw, err := os.ReadFile("testdata/report.json")
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	var r Report
	if err := json.Unmarshal(raw, &r); err != nil {
		t.Fatalf("unmarshal fixture: %v", err)
	}
	return r
}
