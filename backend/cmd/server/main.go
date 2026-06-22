// Command server runs the analysis HTTP API. ANALYSIS_MODE selects the pipeline
// (mock by default, the protected Tier 1 floor; gemini in Tier 2). The mode is
// never exposed in the UI.
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/api"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/llm"
	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/pipeline"
)

func main() {
	loadEnv(".env")

	mode := getenv("ANALYSIS_MODE", "mock")
	var p pipeline.Pipeline
	switch mode {
	case "mock":
		p = pipeline.NewMock()
	case "gemini":
		useVertex := isTrue(os.Getenv("GOOGLE_GENAI_USE_VERTEXAI"))
		fastModel := getenv("GEMINI_MODEL_FAST", "gemini-3.5-flash")
		strongModel := getenv("GEMINI_MODEL_STRONG", "gemini-3.1-pro-preview")
		base := llm.Options{
			UseVertex: useVertex,
			APIKey:    os.Getenv("GOOGLE_API_KEY"),
			Project:   os.Getenv("GOOGLE_CLOUD_PROJECT"),
			Location:  os.Getenv("GOOGLE_CLOUD_LOCATION"),
			Timeout:   time.Duration(getenvInt("GEMINI_CALL_TIMEOUT_MS", 90000)) * time.Millisecond,
		}

		backend := "Gemini Developer API (GOOGLE_API_KEY)"
		if useVertex {
			backend = fmt.Sprintf("Vertex AI (project=%s, location=%s)", base.Project, getenv("GOOGLE_CLOUD_LOCATION", "global"))
		}
		log.Printf("initializing Gemini clients via %s (fast=%s, strong=%s)...", backend, fastModel, strongModel)
		ctx := context.Background()

		fastOpts := base
		fastOpts.Model = fastModel
		fastClient, err := llm.New(ctx, fastOpts)
		if err != nil {
			log.Fatalf("failed to initialize fast LLM client: %v", err)
		}
		strongOpts := base
		strongOpts.Model = strongModel
		strongClient, err := llm.New(ctx, strongOpts)
		if err != nil {
			log.Fatalf("failed to initialize strong LLM client: %v", err)
		}

		p = pipeline.NewGeminiPipelineWithIngestion(fastClient, strongClient, pipeline.GeminiIngestionOptions{
			GitHubToken: os.Getenv("GITHUB_TOKEN"),
			MatrixPause: time.Duration(getenvInt("GEMINI_MATRIX_PAUSE_MS", 15000)) * time.Millisecond,
		})
	default:
		log.Printf("ANALYSIS_MODE=%q not available; falling back to mock", mode)
		p = pipeline.NewMock()
	}

	srv := api.New(p)
	addr := ":" + getenv("PORT", "8080")
	log.Printf("listening on %s (ANALYSIS_MODE=%s)", addr, mode)
	if err := http.ListenAndServe(addr, srv.Router()); err != nil {
		log.Fatal(err)
	}
}

func getenvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	n, err := strconv.Atoi(v)
	if err != nil || n < 0 {
		return def
	}
	return n
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// isTrue reports whether an env value is an affirmative flag.
func isTrue(v string) bool {
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on":
		return true
	}
	return false
}

func loadEnv(filepath string) {
	f, err := os.Open(filepath)
	if err != nil {
		return // ignore if file doesn't exist
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		// Remove surrounding quotes if present
		if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}
