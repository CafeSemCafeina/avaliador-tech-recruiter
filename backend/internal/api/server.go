// Package api is the HTTP surface and async runner for the analysis lifecycle
// (spec 002). It depends on the pipeline only through the Pipeline interface and
// gates every report through the eval policy before serving it, so a
// non-compliant report is never returned.
package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/eval"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/export"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/ingest/pdf"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/store"
)

// PDF upload bounds (spec 011 / ADR-0017): 10 MB, 20 pages, 5s extraction.
const (
	maxUploadBytes = 10 << 20
	maxUploadPages = 20
	extractTimeout = 5 * time.Second
)

// Server wires the store and the analysis pipeline behind the HTTP handlers.
type Server struct {
	store    *store.Store
	pipeline pipeline.Pipeline
}

// New returns a Server backed by the given pipeline.
func New(p pipeline.Pipeline) *Server {
	return &Server{store: store.New(), pipeline: p}
}

// Router builds the chi router with all routes mounted.
func (s *Server) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(cors)
	r.Get("/health", s.handleHealth)
	r.Post("/api/documents/extract-text", s.handleExtractText)
	r.Route("/api/analyses", func(r chi.Router) {
		r.Post("/", s.handleCreate)
		r.Get("/{id}", s.handleStatus)
		r.Get("/{id}/events", s.handleEvents)
		r.Get("/{id}/export.md", s.handleExport)
	})
	return r
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// rawJob mirrors JobInput with a plain-string seniority so validation can
// produce a field error instead of a decode failure.
type rawJob struct {
	Description     string   `json:"description"`
	Seniority       string   `json:"seniority"`
	YearsExperience *int     `json:"yearsExperience"`
	StackTags       []string `json:"stackTags"`
	PrimaryStacks   []string `json:"primaryStacks"`
	Notes           string   `json:"notes"`
}

type createRequest struct {
	Job       rawJob                  `json:"job"`
	Candidate contract.CandidateInput `json:"candidate"`
}

func (s *Server) handleCreate(w http.ResponseWriter, r *http.Request) {
	var req createRequest
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"errors": map[string]string{"body": "invalid JSON"}})
		return
	}

	if errs := validate(req); len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"errors": errs})
		return
	}

	job := contract.JobInput{
		Description:     req.Job.Description,
		Seniority:       contract.Seniority(req.Job.Seniority),
		YearsExperience: req.Job.YearsExperience,
		StackTags:       req.Job.StackTags,
		PrimaryStacks:   req.Job.PrimaryStacks,
		Notes:           req.Job.Notes,
	}
	id := s.store.Create(job, req.Candidate)
	go s.run(id, job, req.Candidate)
	writeJSON(w, http.StatusCreated, map[string]string{"analysisId": id})
}

// validate enforces the spec 002 input rules and returns field-level errors.
func validate(req createRequest) map[string]string {
	errs := map[string]string{}

	if !contract.Seniority(req.Job.Seniority).Valid() {
		errs["seniority"] = "must be one of intern, junior, mid, senior, staff"
	}

	if len(req.Job.PrimaryStacks) > 3 {
		errs["primaryStacks"] = "at most 3 primary stacks"
	} else {
		set := map[string]bool{}
		for _, t := range req.Job.StackTags {
			set[strings.ToLower(strings.TrimSpace(t))] = true
		}
		for _, p := range req.Job.PrimaryStacks {
			if !set[strings.ToLower(strings.TrimSpace(p))] {
				errs["primaryStacks"] = "each primary stack must also be in stackTags"
				break
			}
		}
	}

	c := req.Candidate
	if strings.TrimSpace(c.ResumeText) == "" &&
		strings.TrimSpace(c.LinkedinText) == "" &&
		strings.TrimSpace(c.GithubURL) == "" &&
		strings.TrimSpace(c.PortfolioURL) == "" {
		errs["candidate"] = "provide at least a resume or one candidate source"
	}

	return errs
}

// run executes the pipeline asynchronously, gates the report through the policy
// validator, and records the outcome.
func (s *Server) run(id string, job contract.JobInput, cand contract.CandidateInput) {
	s.store.SetRunning(id)
	emit := func(ev pipeline.StageEvent) {
		ev.AnalysisID = id
		s.store.AppendEvent(id, ev)
	}
	report, err := s.pipeline.Run(context.Background(), id, job, cand, emit)
	if err != nil {
		s.store.Fail(id, err.Error())
		return
	}
	if vs := eval.Validate(report, job.Seniority); len(vs) > 0 {
		msgs := make([]string, 0, len(vs))
		for _, v := range vs {
			msgs = append(msgs, v.String())
		}
		s.store.Fail(id, "report failed policy: "+strings.Join(msgs, "; "))
		return
	}
	s.store.Complete(id, report)
}

type statusResponse struct {
	AnalysisID string           `json:"analysisId"`
	State      string           `json:"state"`
	Report     *contract.Report `json:"report,omitempty"`
	Error      string           `json:"error,omitempty"`
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	a, ok := s.store.Get(chi.URLParam(r, "id"))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "analysis not found"})
		return
	}
	resp := statusResponse{AnalysisID: a.ID, State: string(a.State), Error: a.Error}
	if a.State == store.StateCompleted {
		resp.Report = a.Report
	}
	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) handleEvents(w http.ResponseWriter, r *http.Request) {
	history, ch, cancel, ok := s.store.Subscribe(chi.URLParam(r, "id"))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "analysis not found"})
		return
	}
	defer cancel()

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "streaming unsupported"})
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for _, ev := range history {
		writeSSE(w, ev)
	}
	flusher.Flush()

	ctx := r.Context()
	for {
		select {
		case ev, open := <-ch:
			if !open {
				return
			}
			writeSSE(w, ev)
			flusher.Flush()
		case <-ctx.Done():
			return
		}
	}
}

func (s *Server) handleExport(w http.ResponseWriter, r *http.Request) {
	a, ok := s.store.Get(chi.URLParam(r, "id"))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "analysis not found"})
		return
	}
	if a.State != store.StateCompleted || a.Report == nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "analysis not yet complete"})
		return
	}
	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(export.Render(*a.Report)))
}

// extractTextResponse is the small API view over a pdf.Result. PDF bytes never
// enter the pipeline, store, export, or report — this endpoint only returns the
// extracted text so the UI can fill the existing evidence textareas (spec 011).
type extractTextResponse struct {
	Text     string   `json:"text"`
	Pages    int      `json:"pages"`
	HasText  bool     `json:"hasText"`
	Warnings []string `json:"warnings"`
}

// handleExtractText accepts a multipart PDF upload and returns its bounded plain
// text. Errors are field-level JSON and never leak PDF bytes or parser internals.
func (s *Server) handleExtractText(w http.ResponseWriter, r *http.Request) {
	// Hard-bound the whole request body; allow a little overhead for multipart
	// framing so a legitimately sized PDF is not rejected by the wrapper.
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes+(1<<20))
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			writeFieldError(w, http.StatusRequestEntityTooLarge, "file", "file exceeds the 10 MB limit")
			return
		}
		writeFieldError(w, http.StatusBadRequest, "file", "could not read the upload")
		return
	}

	if kind := strings.TrimSpace(r.FormValue("kind")); kind != "" && kind != "resume" && kind != "linkedin" {
		writeFieldError(w, http.StatusBadRequest, "kind", "must be resume or linkedin")
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		writeFieldError(w, http.StatusBadRequest, "file", "a PDF file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil {
		writeFieldError(w, http.StatusBadRequest, "file", "could not read the upload")
		return
	}
	if len(data) > maxUploadBytes {
		writeFieldError(w, http.StatusRequestEntityTooLarge, "file", "file exceeds the 10 MB limit")
		return
	}
	if !bytes.HasPrefix(data, []byte("%PDF-")) {
		writeFieldError(w, http.StatusBadRequest, "file", "file must be a PDF")
		return
	}

	result, err := pdf.Extract(r.Context(), data, pdf.Options{
		MaxBytes: maxUploadBytes,
		MaxPages: maxUploadPages,
		Timeout:  extractTimeout,
	})
	if err != nil {
		switch {
		case errors.Is(err, pdf.ErrSizeLimit):
			writeFieldError(w, http.StatusRequestEntityTooLarge, "file", "file exceeds the 10 MB limit")
		case errors.Is(err, pdf.ErrPageLimit):
			writeFieldError(w, http.StatusBadRequest, "file", "PDF has too many pages (limit 20)")
		default:
			// Timeout or unexpected parser state: degrade safely — the paste
			// path remains available.
			writeFieldError(w, http.StatusBadRequest, "file", "could not extract text from this PDF; paste the text manually")
		}
		return
	}

	warnings := []string{}
	if !result.HasText {
		warnings = append(warnings, "No selectable text found in this PDF (it may be scanned or image-only). You can paste the text manually.")
	}
	writeJSON(w, http.StatusOK, extractTextResponse{
		Text:     result.Text,
		Pages:    result.Pages,
		HasText:  result.HasText,
		Warnings: warnings,
	})
}

func writeFieldError(w http.ResponseWriter, status int, field, msg string) {
	writeJSON(w, status, map[string]any{"errors": map[string]string{field: msg}})
}

func writeSSE(w http.ResponseWriter, ev pipeline.StageEvent) {
	b, err := json.Marshal(ev)
	if err != nil {
		return
	}
	_, _ = w.Write([]byte("data: "))
	_, _ = w.Write(b)
	_, _ = w.Write([]byte("\n\n"))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// cors is a permissive dev CORS middleware (single-user MVP, no auth per
// PRD §7). The Vite dev server and the deployed frontend call cross-origin.
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
