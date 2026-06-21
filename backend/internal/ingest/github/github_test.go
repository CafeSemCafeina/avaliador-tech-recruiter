package github

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

func TestFetchProfileEvidence(t *testing.T) {
	t.Parallel()
	server := fakeGitHub(t, nil)
	client := NewClient()
	client.BaseURL = server.URL
	client.HTTPClient = server.Client()
	client.Timeout = time.Second

	evidence, err := client.Fetch(context.Background(), "https://github.com/octo", "token")
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if evidence.Degraded {
		t.Fatal("expected non-degraded evidence")
	}
	if len(evidence.Sources) == 0 {
		t.Fatal("expected at least one GitHub source")
	}
	for _, src := range evidence.Sources {
		if src.Kind != contract.SourceGitHub {
			t.Fatalf("expected source kind github, got %q", src.Kind)
		}
		if strings.TrimSpace(src.Detail) == "" {
			t.Fatal("expected non-empty source detail")
		}
		assertNoForbiddenText(t, src.Detail)
	}
	if !contains(evidence.Summary.Languages, "Go") || !contains(evidence.Summary.Languages, "TypeScript") {
		t.Fatalf("expected Go and TypeScript languages, got %#v", evidence.Summary.Languages)
	}
	if !evidence.Summary.HasReadme {
		t.Error("expected README signal")
	}
	if !evidence.Summary.HasCI {
		t.Error("expected CI signal")
	}
	if !evidence.Summary.HasTests {
		t.Error("expected test signal")
	}
	if !evidence.Summary.HasDocker {
		t.Error("expected Docker signal")
	}
	if !contains(evidence.Summary.Manifests, "go.mod") {
		t.Fatalf("expected go.mod manifest, got %#v", evidence.Summary.Manifests)
	}
}

func TestFetchRepositoryEvidence(t *testing.T) {
	t.Parallel()
	server := fakeGitHub(t, nil)
	client := NewClient()
	client.BaseURL = server.URL
	client.HTTPClient = server.Client()

	evidence, err := client.Fetch(context.Background(), "https://github.com/octo/alpha-service", "")
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(evidence.Summary.Repositories) != 1 {
		t.Fatalf("expected one repository, got %d", len(evidence.Summary.Repositories))
	}
	if evidence.Summary.Repositories[0].FullName != "octo/alpha-service" {
		t.Fatalf("unexpected repository summary: %#v", evidence.Summary.Repositories[0])
	}
}

func TestFetchDegradesOnHTTPFailures(t *testing.T) {
	t.Parallel()
	for _, status := range []int{http.StatusNotFound, http.StatusForbidden, http.StatusTooManyRequests} {
		t.Run(fmt.Sprintf("status_%d", status), func(t *testing.T) {
			t.Parallel()
			server := fakeGitHub(t, map[string]int{"/users/octo/repos": status})
			client := NewClient()
			client.BaseURL = server.URL
			client.HTTPClient = server.Client()

			evidence, err := client.Fetch(context.Background(), "https://github.com/octo", "")
			if err != nil {
				t.Fatalf("expected degraded nil error, got %v", err)
			}
			if !evidence.Degraded || len(evidence.Sources) != 0 {
				t.Fatalf("expected degraded empty evidence, got %#v", evidence)
			}
		})
	}
}

func TestFetchDegradesOnNetworkError(t *testing.T) {
	t.Parallel()
	client := NewClient()
	client.BaseURL = "http://127.0.0.1:1"
	client.HTTPClient = &http.Client{Timeout: 10 * time.Millisecond}
	client.Timeout = 50 * time.Millisecond

	evidence, err := client.Fetch(context.Background(), "https://github.com/octo", "")
	if err != nil {
		t.Fatalf("expected degraded nil error, got %v", err)
	}
	if !evidence.Degraded || len(evidence.Sources) != 0 {
		t.Fatalf("expected degraded empty evidence, got %#v", evidence)
	}
}

func TestFetchHonorsRepoCapAndContext(t *testing.T) {
	t.Parallel()
	var repoCalls int
	server := fakeGitHub(t, nil)
	client := NewClient()
	client.BaseURL = server.URL
	client.HTTPClient = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if strings.HasPrefix(r.URL.Path, "/repos/") {
			repoCalls++
		}
		return server.Client().Transport.RoundTrip(r)
	})}
	client.MaxRepos = 1
	client.Timeout = time.Second

	evidence, err := client.Fetch(context.Background(), "https://github.com/octo", "")
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	if len(evidence.Summary.Repositories) != 1 {
		t.Fatalf("expected cap to keep one repo, got %d", len(evidence.Summary.Repositories))
	}
	if repoCalls == 0 {
		t.Fatal("expected repository API calls")
	}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	evidence, err = client.Fetch(ctx, "https://github.com/octo", "")
	if err != nil {
		t.Fatalf("expected degraded nil error on cancellation, got %v", err)
	}
	if !evidence.Degraded {
		t.Fatal("expected degraded evidence on cancellation")
	}
}

func TestDefaultFetchDoesNotRunInOfflineSuite(t *testing.T) {
	t.Parallel()
	client := NewClient()
	client.HTTPClient = &http.Client{Transport: forbiddenTransport{t: t}}
	client.BaseURL = "https://api.github.com"

	_, err := client.Fetch(context.Background(), "https://gitlab.com/octo", "")
	if err != nil {
		t.Fatalf("invalid non-GitHub URL should degrade without network, got %v", err)
	}
}

func fakeGitHub(t *testing.T, statuses map[string]int) *httptest.Server {
	t.Helper()
	mux := http.NewServeMux()
	writeFixture := func(w http.ResponseWriter, r *http.Request, fixture string) {
		if status := statuses[r.URL.Path]; status != 0 {
			http.Error(w, http.StatusText(status), status)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		http.ServeFile(w, r, "testdata/"+fixture)
	}
	mux.HandleFunc("/users/octo/repos", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "profile_repos.json")
	})
	mux.HandleFunc("/repos/octo/alpha-service", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "repo_alpha.json")
	})
	mux.HandleFunc("/repos/octo/alpha-service/languages", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "languages_alpha.json")
	})
	mux.HandleFunc("/repos/octo/alpha-service/contents", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "contents_alpha.json")
	})
	mux.HandleFunc("/repos/octo/alpha-service/contents/.github/workflows", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "workflows_alpha.json")
	})
	mux.HandleFunc("/repos/octo/notes", func(w http.ResponseWriter, r *http.Request) {
		writeFixture(w, r, "repo_notes.json")
	})
	mux.HandleFunc("/repos/octo/notes/languages", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"Markdown": 10}`))
	})
	mux.HandleFunc("/repos/octo/notes/contents", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[{"name":"README.md","type":"file"}]`))
	})
	return httptest.NewServer(mux)
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

type forbiddenTransport struct {
	t *testing.T
}

func (f forbiddenTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	f.t.Fatalf("unexpected live network call to %s", r.URL)
	return nil, nil
}

func contains(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}

func assertNoForbiddenText(t *testing.T, text string) {
	t.Helper()
	for _, term := range []string{"score", "rating", "fit", "percentage"} {
		if strings.Contains(strings.ToLower(text), term) {
			t.Fatalf("forbidden vocabulary %q found in %q", term, text)
		}
	}
}
