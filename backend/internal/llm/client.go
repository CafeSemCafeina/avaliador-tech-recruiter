// Package llm wraps the official google.golang.org/genai SDK behind the
// pipeline.LLMClient interface. It supports two backends selected by config
// (ADR-0011): the Vertex AI backend (default in this project, so the GCP Free
// Trial credit applies) and the Gemini Developer API backend (API key). The
// rest of the system depends only on the LLMClient seam, so the backend is
// swappable without touching the pipeline.
package llm

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/genai"
)

// Options configures a Gemini client.
type Options struct {
	// UseVertex selects the Vertex AI backend (ADC auth, billed to the GCP
	// project). When false, the Gemini Developer API backend (API key) is used.
	UseVertex bool
	APIKey    string // Developer API backend
	Project   string // Vertex backend (GOOGLE_CLOUD_PROJECT)
	Location  string // Vertex backend (GOOGLE_CLOUD_LOCATION); defaults to "global"
	Model     string
}

// Client wraps a genai client bound to a single model and implements
// pipeline.LLMClient.
type Client struct {
	client *genai.Client
	model  string
}

// buildClientConfig resolves the genai client config for the selected backend,
// returning a clear error when required fields are missing. Kept separate from
// New so the backend-selection logic is unit-testable without a live client.
func buildClientConfig(opts Options) (*genai.ClientConfig, error) {
	if opts.UseVertex {
		if opts.Project == "" {
			return nil, fmt.Errorf("llm: vertex backend requires GOOGLE_CLOUD_PROJECT")
		}
		location := opts.Location
		if location == "" {
			location = "global"
		}
		return &genai.ClientConfig{
			Backend:  genai.BackendVertexAI,
			Project:  opts.Project,
			Location: location,
		}, nil
	}
	if opts.APIKey == "" {
		return nil, fmt.Errorf("llm: gemini developer backend requires GOOGLE_API_KEY")
	}
	return &genai.ClientConfig{
		Backend: genai.BackendGeminiAPI,
		APIKey:  opts.APIKey,
	}, nil
}

// New initializes a Gemini client for the given options. The Vertex backend
// authenticates via Application Default Credentials (run
// `gcloud auth application-default login`).
func New(ctx context.Context, opts Options) (*Client, error) {
	if opts.Model == "" {
		return nil, fmt.Errorf("llm: model name is required")
	}
	cfg, err := buildClientConfig(opts)
	if err != nil {
		return nil, err
	}
	cli, err := genai.NewClient(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("llm: failed to create genai client: %w", err)
	}
	return &Client{client: cli, model: opts.Model}, nil
}

// Generate sends the prompt to Gemini with timeouts and retries, returning the text content.
func (c *Client) Generate(ctx context.Context, prompt string) (string, error) {
	var lastErr error

	// Retry loop: up to 3 attempts
	for i := 0; i < 3; i++ {
		if err := ctx.Err(); err != nil {
			return "", err
		}

		// Configure 30 second timeout per call
		callCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		resp, err := c.client.Models.GenerateContent(
			callCtx,
			c.model,
			genai.Text(prompt),
			nil, // optional GenerateContentConfig
		)
		cancel()

		if err == nil {
			if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
				return "", fmt.Errorf("llm: received empty content candidates from model")
			}
			return resp.Candidates[0].Content.Parts[0].Text, nil
		}

		lastErr = err

		// Wait before retrying, respecting parent context cancellation
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(time.Duration(i+1) * time.Second):
		}
	}

	return "", fmt.Errorf("llm: generate content failed after retries: %w", lastErr)
}
