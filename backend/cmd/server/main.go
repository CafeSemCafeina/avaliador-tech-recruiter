// Command server runs the analysis HTTP API. ANALYSIS_MODE selects the pipeline
// (mock by default, the protected Tier 1 floor; gemini in Tier 2). The mode is
// never exposed in the UI.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/api"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
)

func main() {
	mode := getenv("ANALYSIS_MODE", "mock")
	var p pipeline.Pipeline
	switch mode {
	case "mock":
		p = pipeline.NewMock()
	default:
		// gemini and other real modes arrive in Tier 2 behind LLMClient.
		log.Printf("ANALYSIS_MODE=%q not available yet; falling back to mock", mode)
		p = pipeline.NewMock()
	}

	srv := api.New(p)
	addr := ":" + getenv("PORT", "8080")
	log.Printf("listening on %s (ANALYSIS_MODE=%s)", addr, mode)
	if err := http.ListenAndServe(addr, srv.Router()); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
