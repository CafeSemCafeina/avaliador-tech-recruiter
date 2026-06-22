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
	"strings"
	"time"

	"cloud.google.com/go/auth/credentials"
	"google.golang.org/genai"
)

// vertexScope is the OAuth scope Vertex AI requires when credentials are built
// explicitly from a service-account key (instead of detected from the
// environment).
const vertexScope = "https://www.googleapis.com/auth/cloud-platform"

// Options configures a Gemini client.
type Options struct {
	// UseVertex selects the Vertex AI backend (ADC auth, billed to the GCP
	// project). When false, the Gemini Developer API backend (API key) is used.
	UseVertex bool
	APIKey    string // Developer API backend
	Project   string // Vertex backend (GOOGLE_CLOUD_PROJECT)
	Location  string // Vertex backend (GOOGLE_CLOUD_LOCATION); defaults to "global"
	// CredentialsJSON is the service-account key as JSON *content* (not a file
	// path). It lets the Vertex backend authenticate where the key arrives as an
	// environment variable rather than a file on disk — e.g. an AWS ECS secret
	// injected from Secrets Manager (ADR-0007). Empty falls back to Application
	// Default Credentials (the local `gcloud auth application-default login`).
	CredentialsJSON string
	Model           string
	Timeout         time.Duration
}

// Client wraps a genai client bound to a single model and implements
// pipeline.LLMClient.
type Client struct {
	client  *genai.Client
	model   string
	timeout time.Duration
}

const maxGenerateAttempts = 4
const defaultGenerateTimeout = 90 * time.Second

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
		cfg := &genai.ClientConfig{
			Backend:  genai.BackendVertexAI,
			Project:  opts.Project,
			Location: location,
		}
		// When the service-account key is supplied as JSON content (an ECS
		// secret env var, ADR-0007) rather than a file, build the credentials
		// explicitly; otherwise leave them nil so the SDK uses ADC.
		if strings.TrimSpace(opts.CredentialsJSON) != "" {
			creds, err := credentials.DetectDefault(&credentials.DetectOptions{
				CredentialsJSON: []byte(opts.CredentialsJSON),
				Scopes:          []string{vertexScope},
			})
			if err != nil {
				return nil, fmt.Errorf("llm: failed to parse vertex credentials JSON: %w", err)
			}
			cfg.Credentials = creds
		}
		return cfg, nil
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
	return &Client{client: cli, model: opts.Model, timeout: resolveGenerateTimeout(opts.Timeout)}, nil
}

// Generate sends the prompt to Gemini with timeouts and retries, returning the text content.
func (c *Client) Generate(ctx context.Context, prompt string) (string, error) {
	var lastErr error

	for i := 0; i < maxGenerateAttempts; i++ {
		if err := ctx.Err(); err != nil {
			return "", err
		}

		callCtx, cancel := context.WithTimeout(ctx, c.timeout)
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
		if i == maxGenerateAttempts-1 {
			break
		}

		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(retryDelay(err, i)):
		}
	}

	return "", fmt.Errorf("llm: generate content failed after retries: %w", lastErr)
}

func resolveGenerateTimeout(timeout time.Duration) time.Duration {
	if timeout > 0 {
		return timeout
	}
	return defaultGenerateTimeout
}

func retryDelay(err error, attempt int) time.Duration {
	if isResourceExhausted(err) {
		delays := []time.Duration{10 * time.Second, 30 * time.Second, 60 * time.Second}
		if attempt < len(delays) {
			return delays[attempt]
		}
		return delays[len(delays)-1]
	}
	return time.Duration(attempt+1) * time.Second
}

func isResourceExhausted(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "resource_exhausted") ||
		strings.Contains(msg, "resource exhausted") ||
		strings.Contains(msg, "error 429")
}
