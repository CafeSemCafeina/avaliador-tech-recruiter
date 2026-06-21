// Package github fetches bounded, read-only public GitHub evidence.
package github

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"sort"
	"strings"
	"time"

	"github.com/CafeSemCafeina/avaliador-tech-recruiter/backend/internal/contract"
)

const (
	defaultBaseURL  = "https://api.github.com"
	defaultMaxRepos = 5
	defaultTimeout  = 5 * time.Second
)

var errDegraded = errors.New("github evidence degraded")

// Evidence is the bounded output consumed by a future GitHubEvidenceAgent.
type Evidence struct {
	Sources  []contract.Source
	Summary  Summary
	Degraded bool
}

// Summary is qualitative and deliberately avoids any final ranking or verdict.
type Summary struct {
	Owner              string
	Repositories       []RepositorySummary
	Languages          []string
	Manifests          []string
	HasReadme          bool
	HasCI              bool
	HasTests           bool
	HasDocker          bool
	RecentActivity     bool
	GitHubLinksChecked []string
}

// RepositorySummary contains lightweight public repository signals.
type RepositorySummary struct {
	FullName       string
	Description    string
	Languages      []string
	Manifests      []string
	HasReadme      bool
	HasCI          bool
	HasTests       bool
	HasDocker      bool
	RecentActivity bool
}

// Client is configurable for offline tests; the zero value is not used.
type Client struct {
	HTTPClient *http.Client
	BaseURL    string
	MaxRepos   int
	Timeout    time.Duration
}

// Fetch uses the default GitHub REST API endpoint. It degrades to empty evidence
// on operational failures so callers can treat missing public data as not
// publicly evidenced.
func Fetch(ctx context.Context, rawURL, token string) (Evidence, error) {
	return NewClient().Fetch(ctx, rawURL, token)
}

func NewClient() Client {
	return Client{
		HTTPClient: http.DefaultClient,
		BaseURL:    defaultBaseURL,
		MaxRepos:   defaultMaxRepos,
		Timeout:    defaultTimeout,
	}
}

func (c Client) Fetch(ctx context.Context, rawURL, token string) (Evidence, error) {
	target, err := parseTarget(rawURL)
	if err != nil {
		return degraded(), nil
	}
	c = c.withDefaults()
	ctx, cancel := context.WithTimeout(ctx, c.Timeout)
	defer cancel()

	if target.Repo != "" {
		repo, err := c.fetchRepository(ctx, target.Owner, target.Repo, token)
		if err != nil {
			return degraded(), nil
		}
		return evidenceFromRepos(target.Owner, []RepositorySummary{repo}), nil
	}

	repos, err := c.fetchProfileRepositories(ctx, target.Owner, token)
	if err != nil {
		return degraded(), nil
	}
	summaries := make([]RepositorySummary, 0, len(repos))
	for _, repo := range repos {
		select {
		case <-ctx.Done():
			return degraded(), nil
		default:
		}
		summary, err := c.fetchRepository(ctx, repo.Owner.Login, repo.Name, token)
		if err != nil {
			continue
		}
		summaries = append(summaries, summary)
	}
	if len(summaries) == 0 {
		return degraded(), nil
	}
	return evidenceFromRepos(target.Owner, summaries), nil
}

func (c Client) withDefaults() Client {
	if c.HTTPClient == nil {
		c.HTTPClient = http.DefaultClient
	}
	if c.BaseURL == "" {
		c.BaseURL = defaultBaseURL
	}
	if c.MaxRepos <= 0 || c.MaxRepos > defaultMaxRepos {
		c.MaxRepos = defaultMaxRepos
	}
	if c.Timeout <= 0 {
		c.Timeout = defaultTimeout
	}
	return c
}

type target struct {
	Owner string
	Repo  string
}

func parseTarget(raw string) (target, error) {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil || u.Host == "" {
		return target{}, fmt.Errorf("github: invalid url")
	}
	host := strings.ToLower(strings.TrimPrefix(u.Host, "www."))
	if host != "github.com" {
		return target{}, fmt.Errorf("github: unsupported host %q", u.Host)
	}
	parts := strings.Split(strings.Trim(u.EscapedPath(), "/"), "/")
	if len(parts) < 1 || parts[0] == "" {
		return target{}, fmt.Errorf("github: missing owner")
	}
	t := target{Owner: path.Clean(parts[0])}
	if len(parts) >= 2 && parts[1] != "" {
		t.Repo = path.Clean(parts[1])
	}
	return t, nil
}

type apiRepo struct {
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	PushedAt    string `json:"pushed_at"`
	Owner       struct {
		Login string `json:"login"`
	} `json:"owner"`
}

type apiContent struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

func (c Client) fetchProfileRepositories(ctx context.Context, owner, token string) ([]apiRepo, error) {
	var repos []apiRepo
	if err := c.getJSON(ctx, fmt.Sprintf("/users/%s/repos?sort=updated&per_page=%d", url.PathEscape(owner), c.MaxRepos), token, &repos); err != nil {
		return nil, err
	}
	if len(repos) > c.MaxRepos {
		repos = repos[:c.MaxRepos]
	}
	return repos, nil
}

func (c Client) fetchRepository(ctx context.Context, owner, repo, token string) (RepositorySummary, error) {
	var api apiRepo
	if err := c.getJSON(ctx, fmt.Sprintf("/repos/%s/%s", url.PathEscape(owner), url.PathEscape(repo)), token, &api); err != nil {
		return RepositorySummary{}, err
	}
	if api.Owner.Login == "" {
		api.Owner.Login = owner
	}
	if api.Name == "" {
		api.Name = repo
	}
	if api.FullName == "" {
		api.FullName = api.Owner.Login + "/" + api.Name
	}

	summary := RepositorySummary{
		FullName:       api.FullName,
		Description:    api.Description,
		RecentActivity: isRecent(api.PushedAt),
	}
	summary.Languages = c.fetchLanguages(ctx, owner, repo, token)
	contents := c.fetchContents(ctx, owner, repo, "", token)
	summary.Manifests, summary.HasDocker, summary.HasTests = inspectRoot(contents)
	summary.HasReadme = hasReadme(contents) || c.exists(ctx, owner, repo, "readme", token)
	summary.HasCI = c.hasCI(ctx, owner, repo, token)
	return summary, nil
}

func (c Client) fetchLanguages(ctx context.Context, owner, repo, token string) []string {
	var langs map[string]int
	if err := c.getJSON(ctx, fmt.Sprintf("/repos/%s/%s/languages", url.PathEscape(owner), url.PathEscape(repo)), token, &langs); err != nil {
		return nil
	}
	out := make([]string, 0, len(langs))
	for lang := range langs {
		out = append(out, lang)
	}
	sort.Strings(out)
	return out
}

func (c Client) fetchContents(ctx context.Context, owner, repo, contentPath, token string) []apiContent {
	endpoint := fmt.Sprintf("/repos/%s/%s/contents", url.PathEscape(owner), url.PathEscape(repo))
	if contentPath != "" {
		endpoint += "/" + strings.TrimPrefix(contentPath, "/")
	}
	var contents []apiContent
	if err := c.getJSON(ctx, endpoint, token, &contents); err != nil {
		return nil
	}
	return contents
}

func (c Client) exists(ctx context.Context, owner, repo, contentPath, token string) bool {
	var content apiContent
	return c.getJSON(ctx, fmt.Sprintf("/repos/%s/%s/%s", url.PathEscape(owner), url.PathEscape(repo), strings.TrimPrefix(contentPath, "/")), token, &content) == nil
}

func (c Client) hasCI(ctx context.Context, owner, repo, token string) bool {
	workflows := c.fetchContents(ctx, owner, repo, ".github/workflows", token)
	return len(workflows) > 0
}

func inspectRoot(contents []apiContent) ([]string, bool, bool) {
	manifestNames := map[string]bool{
		"go.mod":           true,
		"package.json":     true,
		"requirements.txt": true,
		"pyproject.toml":   true,
	}
	var manifests []string
	var hasDocker, hasTests bool
	for _, item := range contents {
		name := strings.ToLower(item.Name)
		if manifestNames[name] {
			manifests = append(manifests, item.Name)
		}
		if name == "dockerfile" || strings.HasPrefix(name, "dockerfile.") {
			hasDocker = true
		}
		if strings.Contains(name, "test") || name == "tests" || name == "__tests__" {
			hasTests = true
		}
	}
	sort.Strings(manifests)
	return manifests, hasDocker, hasTests
}

func hasReadme(contents []apiContent) bool {
	for _, item := range contents {
		if strings.HasPrefix(strings.ToLower(item.Name), "readme") {
			return true
		}
	}
	return false
}

func (c Client) getJSON(ctx context.Context, endpoint, token string, out any) error {
	base, err := url.Parse(c.BaseURL)
	if err != nil {
		return err
	}
	ref, err := url.Parse(endpoint)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, base.ResolveReference(ref).String(), nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound || resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusTooManyRequests {
		return errDegraded
	}
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return fmt.Errorf("github: unexpected status %d", resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func evidenceFromRepos(owner string, repos []RepositorySummary) Evidence {
	summary := Summary{Owner: owner, Repositories: repos, GitHubLinksChecked: []string{"https://github.com/" + owner}}
	langSet := map[string]bool{}
	manifestSet := map[string]bool{}
	for _, repo := range repos {
		for _, lang := range repo.Languages {
			langSet[lang] = true
		}
		for _, manifest := range repo.Manifests {
			manifestSet[manifest] = true
		}
		summary.HasReadme = summary.HasReadme || repo.HasReadme
		summary.HasCI = summary.HasCI || repo.HasCI
		summary.HasTests = summary.HasTests || repo.HasTests || repo.HasCI
		summary.HasDocker = summary.HasDocker || repo.HasDocker
		summary.RecentActivity = summary.RecentActivity || repo.RecentActivity
	}
	for lang := range langSet {
		summary.Languages = append(summary.Languages, lang)
	}
	for manifest := range manifestSet {
		summary.Manifests = append(summary.Manifests, manifest)
	}
	sort.Strings(summary.Languages)
	sort.Strings(summary.Manifests)

	var sources []contract.Source
	for _, repo := range repos {
		detail := repoDetail(repo)
		if detail != "" {
			sources = append(sources, contract.Source{Kind: contract.SourceGitHub, Detail: detail})
		}
	}
	return Evidence{Sources: sources, Summary: summary}
}

func repoDetail(repo RepositorySummary) string {
	var parts []string
	if len(repo.Languages) > 0 {
		parts = append(parts, "languages: "+strings.Join(repo.Languages, ", "))
	}
	if repo.HasReadme {
		parts = append(parts, "README")
	}
	if len(repo.Manifests) > 0 {
		parts = append(parts, "manifests: "+strings.Join(repo.Manifests, ", "))
	}
	if repo.HasCI {
		parts = append(parts, "CI workflow")
	}
	if repo.HasTests {
		parts = append(parts, "test indicators")
	}
	if repo.HasDocker {
		parts = append(parts, "Dockerfile")
	}
	if repo.RecentActivity {
		parts = append(parts, "recent public activity")
	}
	if len(parts) == 0 {
		return ""
	}
	return fmt.Sprintf("Repository %s shows %s.", repo.FullName, strings.Join(parts, "; "))
}

func isRecent(raw string) bool {
	if raw == "" {
		return false
	}
	t, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return false
	}
	return time.Since(t) <= 365*24*time.Hour
}

func degraded() Evidence {
	return Evidence{Degraded: true}
}
