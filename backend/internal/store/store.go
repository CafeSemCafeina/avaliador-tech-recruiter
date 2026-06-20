// Package store is the concurrency-safe in-memory analysis store (spec 002).
// State is lost on restart; the Markdown export is the durable artifact
// (TECHNICAL_DESIGN §3). It also brokers SSE: subscribers get the stored event
// history plus a live stream that closes when the analysis reaches a terminal
// state.
package store

import (
	"crypto/rand"
	"encoding/hex"
	"sync"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
)

// State is the analysis lifecycle state.
type State string

const (
	StateQueued    State = "queued"
	StateRunning   State = "running"
	StateCompleted State = "completed"
	StateFailed    State = "failed"
)

// Analysis is the public snapshot of one analysis.
type Analysis struct {
	ID        string
	State     State
	Job       contract.JobInput
	Candidate contract.CandidateInput
	Events    []pipeline.StageEvent
	Report    *contract.Report
	Error     string
}

type entry struct {
	a    Analysis
	subs map[chan pipeline.StageEvent]struct{}
	done bool
}

// Store holds all analyses in memory.
type Store struct {
	mu       sync.Mutex
	analyses map[string]*entry
}

// New returns an empty store.
func New() *Store {
	return &Store{analyses: make(map[string]*entry)}
}

// Create registers a new queued analysis and returns its id.
func (s *Store) Create(job contract.JobInput, cand contract.CandidateInput) string {
	id := newID()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.analyses[id] = &entry{
		a:    Analysis{ID: id, State: StateQueued, Job: job, Candidate: cand},
		subs: make(map[chan pipeline.StageEvent]struct{}),
	}
	return id
}

// Get returns a copy of the analysis and whether it exists.
func (s *Store) Get(id string) (Analysis, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.analyses[id]
	if !ok {
		return Analysis{}, false
	}
	return e.snapshot(), true
}

// SetRunning moves an analysis into the running state.
func (s *Store) SetRunning(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if e, ok := s.analyses[id]; ok {
		e.a.State = StateRunning
	}
}

// AppendEvent stores a stage event and broadcasts it to live subscribers.
func (s *Store) AppendEvent(id string, ev pipeline.StageEvent) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.analyses[id]
	if !ok {
		return
	}
	e.a.Events = append(e.a.Events, ev)
	for ch := range e.subs {
		select {
		case ch <- ev:
		default: // never block the runner on a slow subscriber
		}
	}
}

// Complete stores the final report, marks the analysis completed, and closes
// live subscribers.
func (s *Store) Complete(id string, report contract.Report) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.analyses[id]
	if !ok {
		return
	}
	r := report
	e.a.Report = &r
	e.a.State = StateCompleted
	e.finish()
}

// Fail marks the analysis failed with a message and closes live subscribers.
func (s *Store) Fail(id, msg string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.analyses[id]
	if !ok {
		return
	}
	e.a.State = StateFailed
	e.a.Error = msg
	e.finish()
}

// Subscribe returns the current event history plus a channel of future events.
// The channel is closed when the analysis reaches a terminal state. If the
// analysis is already terminal, the returned channel is already closed. The
// caller must invoke cancel to release the subscription.
func (s *Store) Subscribe(id string) (history []pipeline.StageEvent, ch <-chan pipeline.StageEvent, cancel func(), ok bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, exists := s.analyses[id]
	if !exists {
		return nil, nil, nil, false
	}
	history = append(history, e.a.Events...)
	c := make(chan pipeline.StageEvent, 64)
	if e.done {
		close(c)
		return history, c, func() {}, true
	}
	e.subs[c] = struct{}{}
	cancel = func() {
		s.mu.Lock()
		defer s.mu.Unlock()
		if _, still := e.subs[c]; still {
			delete(e.subs, c)
			close(c)
		}
	}
	return history, c, cancel, true
}

func (e *entry) snapshot() Analysis {
	a := e.a
	a.Events = append([]pipeline.StageEvent(nil), e.a.Events...)
	return a
}

// finish closes all subscriber channels exactly once. Callers hold s.mu.
func (e *entry) finish() {
	if e.done {
		return
	}
	e.done = true
	for ch := range e.subs {
		delete(e.subs, ch)
		close(ch)
	}
}

func newID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "analysis_" + hex.EncodeToString(b)
}
