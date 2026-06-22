package llm

import (
	"errors"
	"testing"
	"time"

	"google.golang.org/genai"
)

func TestBuildClientConfigVertex(t *testing.T) {
	cfg, err := buildClientConfig(Options{UseVertex: true, Project: "my-proj", Location: "us-central1", Model: "m"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Backend != genai.BackendVertexAI || cfg.Project != "my-proj" || cfg.Location != "us-central1" {
		t.Errorf("unexpected vertex config: %+v", cfg)
	}
}

func TestBuildClientConfigVertexDefaultsLocation(t *testing.T) {
	cfg, err := buildClientConfig(Options{UseVertex: true, Project: "my-proj"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Location != "global" {
		t.Errorf("expected default location 'global', got %q", cfg.Location)
	}
}

func TestBuildClientConfigVertexRequiresProject(t *testing.T) {
	if _, err := buildClientConfig(Options{UseVertex: true}); err == nil {
		t.Error("expected error when vertex backend has no project")
	}
}

func TestBuildClientConfigVertexNoCredentialsJSONUsesADC(t *testing.T) {
	cfg, err := buildClientConfig(Options{UseVertex: true, Project: "my-proj"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Credentials != nil {
		t.Error("expected nil credentials (ADC fallback) when no CredentialsJSON is set")
	}
}

func TestBuildClientConfigVertexInvalidCredentialsJSON(t *testing.T) {
	_, err := buildClientConfig(Options{UseVertex: true, Project: "my-proj", CredentialsJSON: "{not valid json"})
	if err == nil {
		t.Error("expected error when CredentialsJSON is not valid JSON")
	}
}

func TestBuildClientConfigDeveloperAPI(t *testing.T) {
	cfg, err := buildClientConfig(Options{APIKey: "k"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Backend != genai.BackendGeminiAPI || cfg.APIKey != "k" {
		t.Errorf("unexpected developer config: %+v", cfg)
	}
}

func TestBuildClientConfigDeveloperRequiresKey(t *testing.T) {
	if _, err := buildClientConfig(Options{}); err == nil {
		t.Error("expected error when developer backend has no API key")
	}
}

func TestResolveGenerateTimeout(t *testing.T) {
	if got := resolveGenerateTimeout(0); got != defaultGenerateTimeout {
		t.Fatalf("expected default timeout, got %s", got)
	}
	if got := resolveGenerateTimeout(2 * time.Minute); got != 2*time.Minute {
		t.Fatalf("expected explicit timeout, got %s", got)
	}
}

func TestRetryDelayUsesLongerBackoffForResourceExhausted(t *testing.T) {
	err := errors.New("Error 429, Status: RESOURCE_EXHAUSTED")
	if got := retryDelay(err, 0); got != 10*time.Second {
		t.Fatalf("attempt 0: expected 10s, got %s", got)
	}
	if got := retryDelay(err, 1); got != 30*time.Second {
		t.Fatalf("attempt 1: expected 30s, got %s", got)
	}
}

func TestRetryDelayKeepsShortBackoffForOtherErrors(t *testing.T) {
	err := errors.New("temporary network error")
	if got := retryDelay(err, 1); got != 2*time.Second {
		t.Fatalf("expected ordinary retry backoff, got %s", got)
	}
}

func TestIsResourceExhaustedRecognizesVertexAndDeveloperAPI429s(t *testing.T) {
	cases := []string{
		"Error 429, Status: RESOURCE_EXHAUSTED",
		"Resource exhausted. Please try again later.",
		"Your prepayment credits are depleted. Status: RESOURCE_EXHAUSTED",
	}
	for _, msg := range cases {
		if !isResourceExhausted(errors.New(msg)) {
			t.Fatalf("expected resource exhausted detection for %q", msg)
		}
	}
}
