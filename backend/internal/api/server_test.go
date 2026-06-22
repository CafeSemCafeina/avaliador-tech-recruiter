package api

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/store"
)

func validBody() string {
	return `{
		"job": {"description":"d","seniority":"mid","stackTags":["React","Go"],"primaryStacks":["React"],"notes":""},
		"candidate": {"resumeText":"React work","githubUrl":"https://github.com/example"}
	}`
}

func post(t *testing.T, ts *httptest.Server, body string) *http.Response {
	t.Helper()
	resp, err := http.Post(ts.URL+"/api/analyses", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatalf("POST: %v", err)
	}
	return resp
}

func decodeID(t *testing.T, resp *http.Response) string {
	t.Helper()
	var out map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("decode: %v", err)
	}
	return out["analysisId"]
}

func waitState(t *testing.T, s *Server, id string, want store.State) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if a, ok := s.store.Get(id); ok && a.State == want {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("analysis %s did not reach state %q in time", id, want)
}

// blockingPipeline lets a test observe the running state before completion.
type blockingPipeline struct {
	release chan struct{}
	report  contract.Report
}

func (b *blockingPipeline) Run(ctx context.Context, id string, job contract.JobInput, cand contract.CandidateInput, emit pipeline.EmitFunc) (contract.Report, error) {
	<-b.release
	return b.report, nil
}

func compliantReport(t *testing.T) contract.Report {
	t.Helper()
	rep, err := pipeline.NewMock().Run(context.Background(), "x",
		contract.JobInput{Seniority: contract.SeniorityMid, StackTags: []string{"React"}, PrimaryStacks: []string{"React"}},
		contract.CandidateInput{ResumeText: "React", GithubURL: "https://github.com/example"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	return rep
}

// AC1: valid payload -> 201 + id, and the analysis runs then completes.
func TestCreateRunsAndCompletes(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()

	resp := post(t, ts, validBody())
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}
	id := decodeID(t, resp)
	if id == "" {
		t.Fatal("missing analysisId")
	}
	waitState(t, s, id, store.StateCompleted)
}

// AC1 (running visible) + AC5 (409 while running): use a blocking pipeline.
func TestRunningStateAndExportConflict(t *testing.T) {
	bp := &blockingPipeline{release: make(chan struct{}), report: compliantReport(t)}
	s := New(bp)
	ts := httptest.NewServer(s.Router())
	defer ts.Close()

	id := decodeID(t, post(t, ts, validBody()))
	waitState(t, s, id, store.StateRunning)

	exp, _ := http.Get(ts.URL + "/api/analyses/" + id + "/export.md")
	if exp.StatusCode != http.StatusConflict {
		t.Fatalf("export while running: expected 409, got %d", exp.StatusCode)
	}

	close(bp.release)
	waitState(t, s, id, store.StateCompleted)

	exp2, _ := http.Get(ts.URL + "/api/analyses/" + id + "/export.md")
	if exp2.StatusCode != http.StatusOK {
		t.Fatalf("export when complete: expected 200, got %d", exp2.StatusCode)
	}
	if ct := exp2.Header.Get("Content-Type"); !strings.HasPrefix(ct, "text/markdown") {
		t.Fatalf("expected text/markdown, got %q", ct)
	}
}

// AC2: too many primary stacks, or a primary stack not in stackTags -> 400.
func TestValidationPrimaryStacks(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()

	cases := []string{
		`{"job":{"seniority":"mid","stackTags":["a","b","c","d"],"primaryStacks":["a","b","c","d"]},"candidate":{"resumeText":"x"}}`,
		`{"job":{"seniority":"mid","stackTags":["React"],"primaryStacks":["Go"]},"candidate":{"resumeText":"x"}}`,
	}
	for _, body := range cases {
		resp := post(t, ts, body)
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("expected 400 for %s, got %d", body, resp.StatusCode)
		}
	}
}

// AC3: invalid seniority -> 400.
func TestValidationSeniority(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()
	resp := post(t, ts, `{"job":{"seniority":"principal","stackTags":["React"],"primaryStacks":["React"]},"candidate":{"resumeText":"x"}}`)
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
}

// AC4: completed analysis returns a contract-valid Report.
func TestStatusIncludesValidReport(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()

	id := decodeID(t, post(t, ts, validBody()))
	waitState(t, s, id, store.StateCompleted)

	resp, _ := http.Get(ts.URL + "/api/analyses/" + id)
	var sr statusResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		t.Fatal(err)
	}
	if sr.State != "completed" || sr.Report == nil {
		t.Fatalf("expected completed report, got state=%s report=%v", sr.State, sr.Report)
	}
	if err := sr.Report.Validate(); err != nil {
		t.Fatalf("served report invalid: %v", err)
	}
}

// AC6: events stream replays history then terminates after the terminal state.
func TestEventsStream(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()

	id := decodeID(t, post(t, ts, validBody()))
	waitState(t, s, id, store.StateCompleted)

	resp, err := http.Get(ts.URL + "/api/analyses/" + id + "/events")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if ct := resp.Header.Get("Content-Type"); !strings.HasPrefix(ct, "text/event-stream") {
		t.Fatalf("expected SSE content type, got %q", ct)
	}
	var count int
	sc := bufio.NewScanner(resp.Body)
	for sc.Scan() {
		if bytes.HasPrefix(sc.Bytes(), []byte("data: ")) {
			count++
		}
	}
	// Ten stages, each running+completed.
	if count != 2*len(pipeline.Stages) {
		t.Fatalf("expected %d events, got %d", 2*len(pipeline.Stages), count)
	}
}

// AC7: unknown id -> 404 on status, events, and export.
func TestUnknownID(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()
	for _, path := range []string{"/api/analyses/nope", "/api/analyses/nope/events", "/api/analyses/nope/export.md"} {
		resp, _ := http.Get(ts.URL + path)
		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("%s: expected 404, got %d", path, resp.StatusCode)
		}
	}
}

// --- spec 011: PDF upload / extract-text endpoint ---

// multipartUpload builds a multipart/form-data body. An empty field skips the
// file part; an empty kind skips the kind field.
func multipartUpload(t *testing.T, field, filename string, data []byte, kind string) (*bytes.Buffer, string) {
	t.Helper()
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	if field != "" {
		fw, err := mw.CreateFormFile(field, filename)
		if err != nil {
			t.Fatalf("CreateFormFile: %v", err)
		}
		if _, err := fw.Write(data); err != nil {
			t.Fatalf("write file part: %v", err)
		}
	}
	if kind != "" {
		if err := mw.WriteField("kind", kind); err != nil {
			t.Fatalf("write kind: %v", err)
		}
	}
	if err := mw.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}
	return &buf, mw.FormDataContentType()
}

func postUpload(t *testing.T, ts *httptest.Server, field, filename string, data []byte, kind string) *http.Response {
	t.Helper()
	body, ct := multipartUpload(t, field, filename, data, kind)
	resp, err := http.Post(ts.URL+"/api/documents/extract-text", ct, body)
	if err != nil {
		t.Fatalf("POST upload: %v", err)
	}
	return resp
}

func readFixture(t *testing.T, name string) []byte {
	t.Helper()
	data, err := os.ReadFile("testdata/" + name)
	if err != nil {
		t.Fatalf("read fixture %s: %v", name, err)
	}
	return data
}

type extractResp struct {
	Text     string   `json:"text"`
	Pages    int      `json:"pages"`
	HasText  bool     `json:"hasText"`
	Warnings []string `json:"warnings"`
}

// AC1: a text-based PDF returns 200 with text, page count, and hasText=true.
func TestExtractTextFromTextPDF(t *testing.T) {
	ts := httptest.NewServer(New(pipeline.NewMock()).Router())
	defer ts.Close()

	resp := postUpload(t, ts, "file", "resume.pdf", readFixture(t, "resume_text.pdf"), "resume")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	var out extractResp
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if !out.HasText || strings.TrimSpace(out.Text) == "" {
		t.Fatalf("expected extracted text, got %+v", out)
	}
	if out.Pages < 1 {
		t.Fatalf("expected >=1 page, got %d", out.Pages)
	}
	if len(out.Warnings) != 0 {
		t.Fatalf("expected no warnings, got %v", out.Warnings)
	}
}

// AC2: a no-text PDF returns 200, hasText=false, and a user-safe warning.
func TestExtractTextNoText(t *testing.T) {
	ts := httptest.NewServer(New(pipeline.NewMock()).Router())
	defer ts.Close()

	resp := postUpload(t, ts, "file", "scan.pdf", readFixture(t, "empty_page.pdf"), "")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	var out extractResp
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if out.HasText {
		t.Fatalf("expected hasText=false, got %+v", out)
	}
	if len(out.Warnings) == 0 {
		t.Fatal("expected a warning for the no-text PDF")
	}
}

// AC3: missing file, non-PDF content, and invalid kind each return a bounded 4xx.
func TestExtractTextBadRequests(t *testing.T) {
	ts := httptest.NewServer(New(pipeline.NewMock()).Router())
	defer ts.Close()

	cases := []struct {
		name     string
		field    string
		data     []byte
		kind     string
		wantCode int
	}{
		{"missing file", "", nil, "resume", http.StatusBadRequest},
		{"non-pdf bytes", "file", []byte("this is not a pdf"), "resume", http.StatusBadRequest},
		{"invalid kind", "file", []byte("%PDF-1.4 minimal"), "spreadsheet", http.StatusBadRequest},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			resp := postUpload(t, ts, tc.field, "x.pdf", tc.data, tc.kind)
			if resp.StatusCode != tc.wantCode {
				t.Fatalf("expected %d, got %d", tc.wantCode, resp.StatusCode)
			}
			var body map[string]any
			if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
				t.Fatalf("decode error body: %v", err)
			}
			if _, ok := body["errors"]; !ok {
				t.Fatalf("expected field-level errors, got %v", body)
			}
		})
	}
}

// AC3: an oversized upload returns 413 and does not panic.
func TestExtractTextOversized(t *testing.T) {
	ts := httptest.NewServer(New(pipeline.NewMock()).Router())
	defer ts.Close()

	big := make([]byte, (10<<20)+(2<<20)) // 12 MB
	copy(big, []byte("%PDF-1.4"))
	resp := postUpload(t, ts, "file", "big.pdf", big, "resume")
	if resp.StatusCode != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d", resp.StatusCode)
	}
}

// AC1: health endpoint.
func TestHealth(t *testing.T) {
	s := New(pipeline.NewMock())
	ts := httptest.NewServer(s.Router())
	defer ts.Close()
	resp, _ := http.Get(ts.URL + "/health")
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
