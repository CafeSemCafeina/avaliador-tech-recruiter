package llm

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/genai"
)

// Client wraps the official google.golang.org/genai client and implements
// the pipeline.LLMClient interface.
type Client struct {
	client *genai.Client
	model  string
}

// NewClient initializes a new Gemini client.
func NewClient(ctx context.Context, apiKey, model string) (*Client, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("llm: api key is required")
	}
	if model == "" {
		return nil, fmt.Errorf("llm: model name is required")
	}

	cli, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return nil, fmt.Errorf("llm: failed to create genai client: %w", err)
	}

	return &Client{
		client: cli,
		model:  model,
	}, nil
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
