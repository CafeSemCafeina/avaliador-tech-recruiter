package pdf

import (
	"context"
	"errors"
	"os"
	"strings"
	"testing"
	"time"
)

func TestExtractTextPDF(t *testing.T) {
	t.Parallel()
	data := readFixture(t, "resume_text.pdf")

	result, err := Extract(context.Background(), data, Options{Timeout: time.Second})
	if err != nil {
		t.Fatalf("Extract: %v", err)
	}
	if !result.HasText {
		t.Fatal("expected text-based PDF to report text")
	}
	if result.Pages != 1 {
		t.Fatalf("expected one page, got %d", result.Pages)
	}
	for _, phrase := range []string{"Fictitious Resume", "Go backend evidence"} {
		if !strings.Contains(result.Text, phrase) {
			t.Fatalf("expected extracted text to contain %q, got %q", phrase, result.Text)
		}
	}
}

func TestExtractRejectsOversizedPDF(t *testing.T) {
	t.Parallel()
	data := readFixture(t, "resume_text.pdf")

	result, err := Extract(context.Background(), data, Options{MaxBytes: len(data) - 1, Timeout: time.Second})
	if !errors.Is(err, ErrSizeLimit) {
		t.Fatalf("expected size limit error, got %v", err)
	}
	if result.HasText || result.Text != "" {
		t.Fatalf("expected no extraction on bounds error, got %#v", result)
	}
}

func TestExtractDefaultSizeLimitMatchesTenMegabyteProductContract(t *testing.T) {
	t.Parallel()

	withinLimit := make([]byte, 6<<20)
	copy(withinLimit, []byte("%PDF-1.4\nmalformed but within the product size limit"))
	if _, err := Extract(context.Background(), withinLimit, Options{Timeout: time.Second}); errors.Is(err, ErrSizeLimit) {
		t.Fatalf("6 MB input must not hit the default size limit: %v", err)
	}

	overLimit := make([]byte, (10<<20)+1)
	if _, err := Extract(context.Background(), overLimit, Options{Timeout: time.Second}); !errors.Is(err, ErrSizeLimit) {
		t.Fatalf("expected 10 MB + 1 byte to hit the default size limit, got %v", err)
	}
}

func TestExtractRejectsPageCap(t *testing.T) {
	t.Parallel()
	data := readFixture(t, "two_pages.pdf")

	result, err := Extract(context.Background(), data, Options{MaxPages: 1, Timeout: time.Second})
	if !errors.Is(err, ErrPageLimit) {
		t.Fatalf("expected page limit error, got result=%#v err=%v", result, err)
	}
	if result.HasText || result.Text != "" {
		t.Fatalf("expected no extraction on page-cap error, got %#v", result)
	}
}

func TestExtractEmptyPDFFallsBackToNoText(t *testing.T) {
	t.Parallel()
	data := readFixture(t, "empty_page.pdf")

	result, err := Extract(context.Background(), data, Options{Timeout: time.Second})
	if err != nil {
		t.Fatalf("Extract: %v", err)
	}
	if result.HasText || result.Text != "" {
		t.Fatalf("expected no extractable text, got %#v", result)
	}
	if result.Pages != 1 {
		t.Fatalf("expected one page, got %d", result.Pages)
	}
}

func TestExtractMalformedPDFDoesNotPanic(t *testing.T) {
	t.Parallel()
	result, err := Extract(context.Background(), []byte("%PDF-1.4\nnot a complete file"), Options{Timeout: time.Second})
	if err != nil {
		t.Fatalf("malformed PDF should degrade to no text, got %v", err)
	}
	if result.HasText || result.Text != "" {
		t.Fatalf("expected no text for malformed PDF, got %#v", result)
	}
}

func TestExtractRespectsContextCancellation(t *testing.T) {
	t.Parallel()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := Extract(ctx, readFixture(t, "resume_text.pdf"), Options{Timeout: time.Second})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("expected context cancellation, got %v", err)
	}
}

func TestExtractUsesNoNetworkOrExternalProcess(t *testing.T) {
	t.Parallel()
	source, err := os.ReadFile("pdf.go")
	if err != nil {
		t.Fatalf("read package source: %v", err)
	}
	for _, forbidden := range []string{`"net/http"`, `"net"`, `"os/exec"`} {
		if strings.Contains(string(source), forbidden) {
			t.Fatalf("pure-Go extractor must not import %s", forbidden)
		}
	}

	result, err := Extract(context.Background(), readFixture(t, "resume_text.pdf"), Options{Timeout: time.Second})
	if err != nil {
		t.Fatalf("Extract: %v", err)
	}
	if !result.HasText {
		t.Fatal("expected fixture text")
	}
}

func readFixture(t *testing.T, name string) []byte {
	t.Helper()
	data, err := os.ReadFile("testdata/" + name)
	if err != nil {
		t.Fatalf("read fixture %s: %v", name, err)
	}
	return data
}
