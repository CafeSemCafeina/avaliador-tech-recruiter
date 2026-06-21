// Package pdf extracts bounded plain text from text-based PDF uploads.
package pdf

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	ledongpdf "github.com/ledongthuc/pdf"
)

const (
	defaultMaxBytes = 10 << 20
	defaultMaxPages = 20
	defaultTimeout  = 5 * time.Second
)

var (
	ErrSizeLimit = errors.New("pdf: file exceeds size limit")
	ErrPageLimit = errors.New("pdf: file exceeds page limit")
)

// Options controls safety bounds for a single extraction call.
type Options struct {
	MaxBytes int
	MaxPages int
	Timeout  time.Duration
}

// Result is the plain-text extraction result. Empty HasText=false results are
// expected for scanned/image-only PDFs and let callers keep the paste fallback.
type Result struct {
	Text    string
	Pages   int
	HasText bool
}

func Extract(ctx context.Context, data []byte, opts Options) (Result, error) {
	opts = opts.withDefaults()
	if len(data) > opts.MaxBytes {
		return Result{}, fmt.Errorf("%w: %d bytes > %d bytes", ErrSizeLimit, len(data), opts.MaxBytes)
	}
	ctx, cancel := context.WithTimeout(ctx, opts.Timeout)
	defer cancel()

	type outcome struct {
		result Result
		err    error
	}
	done := make(chan outcome, 1)
	go func() {
		result, err := extract(data, opts)
		done <- outcome{result: result, err: err}
	}()

	select {
	case <-ctx.Done():
		return Result{}, ctx.Err()
	case out := <-done:
		return out.result, out.err
	}
}

func (o Options) withDefaults() Options {
	if o.MaxBytes <= 0 {
		o.MaxBytes = defaultMaxBytes
	}
	if o.MaxPages <= 0 {
		o.MaxPages = defaultMaxPages
	}
	if o.Timeout <= 0 {
		o.Timeout = defaultTimeout
	}
	return o
}

func extract(data []byte, opts Options) (Result, error) {
	reader := bytes.NewReader(data)
	pdfReader, err := ledongpdf.NewReader(reader, int64(len(data)))
	if err != nil {
		return Result{}, nil
	}
	pages := pdfReader.NumPage()
	if pages > opts.MaxPages {
		return Result{}, fmt.Errorf("%w: %d pages > %d pages", ErrPageLimit, pages, opts.MaxPages)
	}
	plainReader, err := pdfReader.GetPlainText()
	if err != nil {
		return Result{Pages: pages}, nil
	}
	textBytes, err := io.ReadAll(plainReader)
	if err != nil {
		return Result{Pages: pages}, nil
	}
	text := normalizeWhitespace(string(textBytes))
	return Result{Text: text, Pages: pages, HasText: text != ""}, nil
}

func normalizeWhitespace(s string) string {
	return strings.Join(strings.Fields(s), " ")
}
