// Package portfolio fetches strictly bounded public portfolio evidence.
package portfolio

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strings"
	"time"

	"golang.org/x/net/html"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

const (
	defaultMaxPages  = 10
	defaultMaxBytes  = 256 << 10
	defaultTimeout   = 5 * time.Second
	defaultPageLimit = 2 * time.Second
)

var defaultPaths = []string{
	"/",
	"/about",
	"/projects",
	"/portfolio",
	"/cv",
	"/resume",
	"/sobre",
	"/projetos",
	"/curriculo",
	"/currículo",
}

var errByteCapExceeded = errors.New("portfolio: byte cap exceeded")

// Evidence is the bounded output consumed by a future PortfolioEvidenceAgent.
type Evidence struct {
	Sources  []contract.Source
	Summary  Summary
	Degraded bool
}

// Summary contains qualitative portfolio signals only.
type Summary struct {
	URL            string
	PagesFetched   []string
	GitHubLinks    []string
	VisibleText    string
	ProjectSignals []string
}

// Options controls crawl bounds and enables offline tests.
type Options struct {
	HTTPClient  *http.Client
	Paths       []string
	MaxPages    int
	MaxBytes    int64
	Timeout     time.Duration
	PageTimeout time.Duration
}

func Fetch(ctx context.Context, rawURL string, opts Options) (Evidence, error) {
	root, err := parseRoot(rawURL)
	if err != nil {
		return degraded(), nil
	}
	opts = opts.withDefaults()
	ctx, cancel := context.WithTimeout(ctx, opts.Timeout)
	defer cancel()

	var pages []pageResult
	var usedBytes int64
	for _, fixedPath := range opts.Paths {
		select {
		case <-ctx.Done():
			return degraded(), nil
		default:
		}
		if len(pages) >= opts.MaxPages {
			break
		}
		if usedBytes >= opts.MaxBytes {
			break
		}
		pageURL := *root
		pageURL.Path = fixedPath
		pageURL.RawQuery = ""
		pageURL.Fragment = ""
		page, size, err := fetchPage(ctx, opts, pageURL.String(), opts.MaxBytes-usedBytes)
		if err != nil {
			if errors.Is(err, errByteCapExceeded) {
				return degraded(), nil
			}
			continue
		}
		usedBytes += size
		pages = append(pages, page)
	}
	if len(pages) == 0 {
		return degraded(), nil
	}
	return evidenceFromPages(root.String(), pages), nil
}

func (o Options) withDefaults() Options {
	if o.HTTPClient == nil {
		o.HTTPClient = &http.Client{
			Timeout: defaultPageLimit,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 3 {
					return http.ErrUseLastResponse
				}
				return nil
			},
		}
	}
	if len(o.Paths) == 0 {
		o.Paths = append([]string(nil), defaultPaths...)
	} else {
		o.Paths = fixedAllowListPaths(o.Paths)
		if len(o.Paths) == 0 {
			o.Paths = append([]string(nil), defaultPaths...)
		}
	}
	if o.MaxPages <= 0 || o.MaxPages > defaultMaxPages {
		o.MaxPages = defaultMaxPages
	}
	if o.MaxBytes <= 0 {
		o.MaxBytes = defaultMaxBytes
	}
	if o.Timeout <= 0 {
		o.Timeout = defaultTimeout
	}
	if o.PageTimeout <= 0 {
		o.PageTimeout = defaultPageLimit
	}
	return o
}

func fixedAllowListPaths(paths []string) []string {
	allowed := make(map[string]bool, len(defaultPaths))
	for _, fixedPath := range defaultPaths {
		allowed[normalizeFixedPath(fixedPath)] = true
	}
	seen := map[string]bool{}
	var out []string
	for _, candidate := range paths {
		normalized := normalizeFixedPath(candidate)
		if !allowed[normalized] || seen[normalized] {
			continue
		}
		seen[normalized] = true
		out = append(out, normalized)
	}
	return out
}

func normalizeFixedPath(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	if parsed, err := url.Parse(raw); err == nil && parsed.Path != "" {
		raw = parsed.Path
	}
	if decoded, err := url.PathUnescape(raw); err == nil {
		raw = decoded
	}
	if !strings.HasPrefix(raw, "/") {
		raw = "/" + raw
	}
	cleaned := path.Clean(raw)
	if cleaned == "." {
		return "/"
	}
	return cleaned
}

func parseRoot(raw string) (*url.URL, error) {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Host == "" {
		return nil, fmt.Errorf("portfolio: invalid url")
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return nil, fmt.Errorf("portfolio: unsupported scheme")
	}
	u.Path = "/"
	u.RawQuery = ""
	u.Fragment = ""
	return u, nil
}

type pageResult struct {
	Path        string
	Text        string
	Links       []string
	GitHubLinks []string
}

func fetchPage(ctx context.Context, opts Options, rawURL string, remainingBytes int64) (pageResult, int64, error) {
	if remainingBytes <= 0 {
		return pageResult{}, 0, errByteCapExceeded
	}
	pageCtx, cancel := context.WithTimeout(ctx, opts.PageTimeout)
	defer cancel()
	req, err := http.NewRequestWithContext(pageCtx, http.MethodGet, rawURL, nil)
	if err != nil {
		return pageResult{}, 0, err
	}
	resp, err := opts.HTTPClient.Do(req)
	if err != nil {
		return pageResult{}, 0, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return pageResult{}, 0, fmt.Errorf("portfolio: status %d", resp.StatusCode)
	}
	contentType := strings.ToLower(resp.Header.Get("Content-Type"))
	if contentType != "" && !strings.Contains(contentType, "text/html") {
		return pageResult{}, 0, fmt.Errorf("portfolio: unsupported content type")
	}
	limited := io.LimitReader(resp.Body, remainingBytes+1)
	body, err := io.ReadAll(limited)
	if err != nil {
		return pageResult{}, 0, err
	}
	if int64(len(body)) > remainingBytes {
		return pageResult{}, int64(len(body)), errByteCapExceeded
	}
	text, links := extractVisibleTextAndLinks(strings.NewReader(string(body)), rawURL)
	u, _ := url.Parse(rawURL)
	return pageResult{
		Path:        u.Path,
		Text:        text,
		Links:       links,
		GitHubLinks: filterGitHubLinks(links),
	}, int64(len(body)), nil
}

func extractVisibleTextAndLinks(r io.Reader, base string) (string, []string) {
	doc, err := html.Parse(r)
	if err != nil {
		return "", nil
	}
	baseURL, _ := url.Parse(base)
	var textParts []string
	linkSet := map[string]bool{}
	var walk func(*html.Node, bool)
	walk = func(n *html.Node, hidden bool) {
		if n.Type == html.ElementNode {
			name := strings.ToLower(n.Data)
			if name == "script" || name == "style" || name == "noscript" {
				hidden = true
			}
			if name == "a" {
				for _, attr := range n.Attr {
					if strings.ToLower(attr.Key) == "href" {
						if resolved := resolveLink(baseURL, attr.Val); resolved != "" {
							linkSet[resolved] = true
						}
					}
				}
			}
		}
		if n.Type == html.TextNode && !hidden {
			if text := strings.TrimSpace(n.Data); text != "" {
				textParts = append(textParts, text)
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			walk(child, hidden)
		}
	}
	walk(doc, false)
	links := make([]string, 0, len(linkSet))
	for link := range linkSet {
		links = append(links, link)
	}
	sort.Strings(links)
	return strings.Join(strings.Fields(strings.Join(textParts, " ")), " "), links
}

func resolveLink(base *url.URL, href string) string {
	href = strings.TrimSpace(href)
	if href == "" || strings.HasPrefix(href, "#") || strings.HasPrefix(strings.ToLower(href), "javascript:") {
		return ""
	}
	u, err := url.Parse(href)
	if err != nil {
		return ""
	}
	if base != nil {
		u = base.ResolveReference(u)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return ""
	}
	u.Fragment = ""
	return u.String()
}

func filterGitHubLinks(links []string) []string {
	var out []string
	for _, link := range links {
		u, err := url.Parse(link)
		if err == nil && strings.EqualFold(strings.TrimPrefix(u.Host, "www."), "github.com") {
			out = append(out, link)
		}
	}
	return out
}

func evidenceFromPages(root string, pages []pageResult) Evidence {
	var textParts []string
	githubSet := map[string]bool{}
	var fetched []string
	var sources []contract.Source
	for _, page := range pages {
		fetched = append(fetched, page.Path)
		if page.Text != "" {
			textParts = append(textParts, page.Text)
			sources = append(sources, contract.Source{
				Kind:   contract.SourcePortfolio,
				Detail: fmt.Sprintf("Portfolio path %s exposes visible project or profile text.", page.Path),
			})
		}
		for _, link := range page.GitHubLinks {
			githubSet[link] = true
		}
	}
	var githubLinks []string
	for link := range githubSet {
		githubLinks = append(githubLinks, link)
	}
	sort.Strings(fetched)
	sort.Strings(githubLinks)
	visible := strings.Join(strings.Fields(strings.Join(textParts, " ")), " ")
	if len(visible) > 1200 {
		visible = visible[:1200]
	}
	return Evidence{
		Sources: sources,
		Summary: Summary{
			URL:            root,
			PagesFetched:   fetched,
			GitHubLinks:    githubLinks,
			VisibleText:    visible,
			ProjectSignals: projectSignals(visible),
		},
	}
}

func projectSignals(text string) []string {
	lower := strings.ToLower(text)
	var signals []string
	for _, term := range []string{"project", "case study", "portfolio", "resume", "cv", "projeto", "estudo de caso", "curriculo", "currículo"} {
		if strings.Contains(lower, term) {
			signals = append(signals, term)
		}
	}
	return signals
}

func degraded() Evidence {
	return Evidence{Degraded: true}
}
