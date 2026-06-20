package pipeline

import "context"

// LLMClient is the single seam through which all model access flows (ADR-0011),
// so a provider can be swapped and mocked. The mock pipeline does not use it;
// the gemini pipeline (Tier 2) will. Keeping it here means the gemini
// implementation is a drop-in behind the same Pipeline interface.
type LLMClient interface {
	// Generate returns model output for a prompt. Implementations must respect
	// ctx cancellation.
	Generate(ctx context.Context, prompt string) (string, error)
}
