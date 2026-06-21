package portfolio

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

func TestFetchPortfolioEvidence(t *testing.T) {
	t.Parallel()
	seen := safeSeen{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen.add(r.URL.Path)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		switch r.URL.Path {
		case "/":
			fmt.Fprint(w, `<html><head><style>.x{}</style><script>hidden()</script></head><body><h1>Fictitious portfolio</h1><a href="/projects">Projects</a></body></html>`)
		case "/projects":
			fmt.Fprint(w, `<html><body><h2>Projects</h2><p>Project Atlas case study and delivery notes.</p><a href="https://github.com/octo/atlas">GitHub</a></body></html>`)
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	evidence, err := Fetch(context.Background(), server.URL, Options{HTTPClient: server.Client(), Timeout: time.Second, PageTimeout: time.Second})
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if evidence.Degraded {
		t.Fatal("expected non-degraded evidence")
	}
	if len(evidence.Sources) == 0 {
		t.Fatal("expected at least one portfolio source")
	}
	for _, src := range evidence.Sources {
		if src.Kind != contract.SourcePortfolio {
			t.Fatalf("expected portfolio source, got %q", src.Kind)
		}
		if strings.TrimSpace(src.Detail) == "" {
			t.Fatal("expected non-empty detail")
		}
		assertNoForbiddenText(t, src.Detail)
	}
	if !strings.Contains(evidence.Summary.VisibleText, "Project Atlas case study") {
		t.Fatalf("expected visible project text, got %q", evidence.Summary.VisibleText)
	}
	if len(evidence.Summary.GitHubLinks) != 1 || evidence.Summary.GitHubLinks[0] != "https://github.com/octo/atlas" {
		t.Fatalf("expected recorded GitHub link without fetching it, got %#v", evidence.Summary.GitHubLinks)
	}
	if seen.has("/octo/atlas") {
		t.Fatal("crawler must not fetch GitHub links")
	}
}

func TestFetchPortugueseAllowListPath(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		if r.URL.Path == "/projetos" {
			fmt.Fprint(w, `<html><body><h1>Projetos</h1><p>Portfolio com estudo de caso ficticio.</p></body></html>`)
			return
		}
		http.NotFound(w, r)
	}))
	defer server.Close()

	evidence, err := Fetch(context.Background(), server.URL, Options{HTTPClient: server.Client(), Timeout: time.Second, PageTimeout: time.Second})
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if evidence.Degraded {
		t.Fatal("expected Portuguese fixed path to produce evidence")
	}
	if !strings.Contains(evidence.Summary.VisibleText, "Projetos") {
		t.Fatalf("expected Portuguese path text, got %q", evidence.Summary.VisibleText)
	}
}

func TestFetchDegradesOnUnreachableRedirectLoopAndByteCap(t *testing.T) {
	t.Parallel()
	t.Run("unreachable", func(t *testing.T) {
		t.Parallel()
		evidence, err := Fetch(context.Background(), "http://127.0.0.1:1", Options{Timeout: 50 * time.Millisecond, PageTimeout: 10 * time.Millisecond})
		if err != nil {
			t.Fatalf("expected degraded nil error, got %v", err)
		}
		if !evidence.Degraded || len(evidence.Sources) != 0 {
			t.Fatalf("expected degraded empty evidence, got %#v", evidence)
		}
	})

	t.Run("redirect_loop", func(t *testing.T) {
		t.Parallel()
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, r.URL.String(), http.StatusFound)
		}))
		defer server.Close()
		client := server.Client()
		client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			if len(via) >= 2 {
				return http.ErrUseLastResponse
			}
			return nil
		}
		evidence, err := Fetch(context.Background(), server.URL, Options{HTTPClient: client, Timeout: time.Second, PageTimeout: time.Second})
		if err != nil {
			t.Fatalf("expected degraded nil error, got %v", err)
		}
		if !evidence.Degraded || len(evidence.Sources) != 0 {
			t.Fatalf("expected degraded empty evidence, got %#v", evidence)
		}
	})

	t.Run("byte_cap", func(t *testing.T) {
		t.Parallel()
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			fmt.Fprint(w, "<html><body>"+strings.Repeat("large ", 100)+"</body></html>")
		}))
		defer server.Close()
		evidence, err := Fetch(context.Background(), server.URL, Options{HTTPClient: server.Client(), MaxBytes: 20, Timeout: time.Second, PageTimeout: time.Second})
		if err != nil {
			t.Fatalf("expected degraded nil error, got %v", err)
		}
		if !evidence.Degraded || len(evidence.Sources) != 0 {
			t.Fatalf("expected degraded empty evidence, got %#v", evidence)
		}
	})
}

func TestFetchCapsPagesAndUsesOnlyAllowList(t *testing.T) {
	t.Parallel()
	seen := safeSeen{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen.add(r.URL.Path)
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, `<html><body><p>Page %s project text.</p><a href="/secret">Secret</a></body></html>`, r.URL.Path)
	}))
	defer server.Close()

	evidence, err := Fetch(context.Background(), server.URL, Options{
		HTTPClient:  server.Client(),
		MaxPages:    2,
		Timeout:     time.Second,
		PageTimeout: time.Second,
	})
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(evidence.Summary.PagesFetched) != 2 {
		t.Fatalf("expected two fetched pages, got %#v", evidence.Summary.PagesFetched)
	}
	if seen.has("/secret") {
		t.Fatal("crawler followed an arbitrary link outside the allow-list")
	}
}

func TestFetchRespectsContextCancellation(t *testing.T) {
	t.Parallel()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	evidence, err := Fetch(ctx, "https://example.test", Options{})
	if err != nil {
		t.Fatalf("expected degraded nil error, got %v", err)
	}
	if !evidence.Degraded {
		t.Fatal("expected degraded evidence on cancellation")
	}
}

func TestFetchNoLiveNetworkGuard(t *testing.T) {
	t.Parallel()
	client := &http.Client{Transport: forbiddenTransport{t: t}}
	evidence, err := Fetch(context.Background(), "nota-url", Options{HTTPClient: client})
	if err != nil {
		t.Fatalf("invalid URL should degrade without network, got %v", err)
	}
	if !evidence.Degraded {
		t.Fatal("expected degraded evidence")
	}
}

type safeSeen struct {
	mu    sync.Mutex
	paths []string
}

func (s *safeSeen) add(path string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paths = append(s.paths, path)
}

func (s *safeSeen) has(path string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, seen := range s.paths {
		if seen == path {
			return true
		}
	}
	return false
}

type forbiddenTransport struct {
	t *testing.T
}

func (f forbiddenTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	f.t.Fatalf("unexpected live network call to %s", r.URL)
	return nil, nil
}

func assertNoForbiddenText(t *testing.T, text string) {
	t.Helper()
	for _, term := range []string{"score", "rating", "fit", "percentage"} {
		if strings.Contains(strings.ToLower(text), term) {
			t.Fatalf("forbidden vocabulary %q found in %q", term, text)
		}
	}
}
