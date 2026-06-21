package llm

import (
	"testing"

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
