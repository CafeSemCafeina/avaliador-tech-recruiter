package export

import (
	"encoding/json"
	"os"
	"strings"
	"testing"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/eval"
)

// sectionOrder is the TECHNICAL_DESIGN §5 section order the export must follow.
var sectionOrder = []string{
	"## Executive summary",
	"## Badges",
	"## Evidence matrix",
	"## Confirmed strengths",
	"## Strengths needing validation",
	"## Confirmed gaps",
	"## Weak signals needing validation",
	"## STAR interview questions",
	"## Recruiter summary",
	"## Hiring manager summary",
	"## Methodology",
	"## Limitations",
}

func loadReport(t *testing.T) contract.Report {
	t.Helper()
	raw, err := os.ReadFile("../contract/testdata/report.json")
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	var r contract.Report
	if err := json.Unmarshal(raw, &r); err != nil {
		t.Fatalf("unmarshal fixture: %v", err)
	}
	return r
}

// AC1: all twelve sections render in the specified order.
func TestRenderSectionsInOrder(t *testing.T) {
	md := Render(loadReport(t))
	prev := -1
	for _, sec := range sectionOrder {
		idx := strings.Index(md, sec)
		if idx < 0 {
			t.Errorf("missing section %q", sec)
			continue
		}
		if idx <= prev {
			t.Errorf("section %q out of order (idx %d <= prev %d)", sec, idx, prev)
		}
		prev = idx
	}
}

// AC2: the export is byte-identical across runs.
func TestRenderDeterministic(t *testing.T) {
	r := loadReport(t)
	if Render(r) != Render(r) {
		t.Error("render is not deterministic")
	}
}

// AC3: the rendered Markdown introduces no policy violation.
func TestRenderPassesPolicy(t *testing.T) {
	md := Render(loadReport(t))
	if vs := eval.ScanText(md); len(vs) != 0 {
		t.Fatalf("rendered markdown has policy violations: %v", vs)
	}
}

// AC4: every QuadrantItem appears under its correct quadrant heading with its
// sources listed.
func TestRenderEveryItemUnderItsQuadrant(t *testing.T) {
	r := loadReport(t)
	md := Render(r)
	headingFor := map[contract.Quadrant]string{}
	for _, sec := range quadrantSections {
		headingFor[sec.q] = "### " + sec.heading
	}
	for _, it := range r.EvidenceMatrix {
		hIdx := strings.Index(md, headingFor[it.Quadrant])
		tIdx := strings.Index(md, "#### "+it.Title)
		if hIdx < 0 || tIdx < 0 || tIdx < hIdx {
			t.Errorf("item %q not rendered under heading %q", it.Title, headingFor[it.Quadrant])
		}
		for _, s := range it.Sources {
			if !strings.Contains(md, s.Detail) {
				t.Errorf("item %q missing source detail %q in export", it.Title, s.Detail)
			}
		}
	}
}

// Golden-file regression. Regenerate with: UPDATE_GOLDEN=1 go test ./internal/export
func TestRenderGolden(t *testing.T) {
	md := Render(loadReport(t))
	golden := "testdata/report.golden.md"
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		if err := os.WriteFile(golden, []byte(md), 0o644); err != nil {
			t.Fatalf("write golden: %v", err)
		}
		t.Log("golden updated")
		return
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatalf("read golden (run with UPDATE_GOLDEN=1 to create): %v", err)
	}
	if string(want) != md {
		t.Errorf("export does not match golden file %s; rerun with UPDATE_GOLDEN=1 if intended", golden)
	}
}
