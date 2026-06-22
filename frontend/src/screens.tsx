// The four screens (Job Input -> Candidate Evidence -> Analysis Progress ->
// Report), rendered from reducer state and the structured Report JSON. Copy is
// conservative and uncertainty-preserving; nothing here shows a score, ranking,
// or verdict (ADR-0002).
import React, { useState } from 'react';
import type { ChangeEvent, Dispatch } from 'react';
import type {
  CandidateInput,
  JobInput,
  Quadrant,
  Report,
  Seniority,
  StageEvent,
} from './types/contract';
import { SENIORITIES } from './types/contract';
import type { Action, AppState } from './state';
import type { DocumentKind, FieldErrors } from './api';
import { exportUrl, extractPdfText, mergeExtractedText, ValidationError } from './api';
import { formatStackTags, parseStackTagsInput } from './stackTags';

// UI Kit Imports
import { Card } from './components/core/Card';
import { Button } from './components/core/Button';
import { Icon } from './components/core/Icon';
import { Banner } from './components/feedback/Banner';
import { StageItem } from './components/feedback/StageItem';
import { StatusBadge } from './components/feedback/StatusBadge';
import { Field } from './components/forms/Field';
import { Input } from './components/forms/Input';
import { SegmentedControl } from './components/forms/SegmentedControl';
import { Tag } from './components/forms/Tag';
import { Textarea } from './components/forms/Textarea';
import { QuadrantCard } from './components/recruiting/QuadrantCard';
import { QualBadge } from './components/recruiting/QualBadge';
import { SourceCard } from './components/recruiting/SourceCard';
import { StarQuestion } from './components/recruiting/StarQuestion';

const STAGES: { id: string; name: string; detail: string }[] = [
  { id: 'parse_resume', name: 'Parsing resume', detail: 'Extracting clean text' },
  { id: 'job_profile', name: 'Extracting role profile', detail: 'Analyzing seniority and stack' },
  { id: 'linkedin_evidence', name: 'Reading LinkedIn evidence', detail: 'Looking for experience signals' },
  { id: 'github_evidence', name: 'Analyzing GitHub repositories', detail: 'Checking code, languages, and activity' },
  { id: 'portfolio_evidence', name: 'Reading portfolio signals', detail: 'Checking live projects' },
  { id: 'evidence_checker', name: 'Checking claims against evidence', detail: 'Cross-referencing claims' },
  { id: 'evidence_matrix', name: 'Building evidence matrix', detail: 'Categorizing into the 2×2 matrix' },
  { id: 'star_questions', name: 'Generating STAR questions', detail: 'Formulating validation questions' },
  { id: 'analyst_review', name: 'Running analyst self-review', detail: 'Checking tone constraints' },
  { id: 'finalize', name: 'Finalizing report', detail: 'Formatting markdown' },
];

function FieldError({ errors, name }: { errors: FieldErrors; name: string }) {
  if (!errors[name]) return null;
  return <p style={{ color: 'var(--status-gap-fg)', fontSize: '13px', margin: '4px 0 0' }}>{errors[name]}</p>;
}

// ----------------------------------------------------------------------------
// Screen 1: Job Input
// ----------------------------------------------------------------------------
const SectionTitle = ({ n, children, hint }: { n: string; children: React.ReactNode; hint?: string }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{n}</span>
      <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)" }}>{children}</h3>
    </div>
    {hint && <p style={{ margin: "4px 0 0 26px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{hint}</p>}
  </div>
);

export function JobScreen({
  state,
  dispatch,
  onContinue,
}: {
  state: AppState;
  dispatch: Dispatch<Action>;
  onContinue: () => void;
}) {
  const { job, fieldErrors } = state;
  const [stackTagsText, setStackTagsText] = useState(() => formatStackTags(job.stackTags));
  const set = (patch: Partial<JobInput>) => dispatch({ type: 'setJob', job: { ...job, ...patch } });

  const primaryCount = job.primaryStacks.length;

  const togglePrimary = (tag: string) => {
    const has = job.primaryStacks.includes(tag);
    if (has) {
      set({ primaryStacks: job.primaryStacks.filter((t) => t !== tag) });
    } else if (primaryCount < 3) {
      set({ primaryStacks: [...job.primaryStacks, tag] });
    }
  };

  const removeStack = (tag: string) => {
    const nextTags = job.stackTags.filter(t => t !== tag);
    set({ stackTags: nextTags, primaryStacks: job.primaryStacks.filter(t => t !== tag) });
    setStackTagsText(formatStackTags(nextTags));
  };

  const addStackText = () => {
    const nextTags = parseStackTagsInput(stackTagsText);
    set({ stackTags: nextTags, primaryStacks: job.primaryStacks.filter(t => nextTags.includes(t)) });
    setStackTagsText("");
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>Define the role baseline</h1>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
          Evidence-first screening prep for technical roles. The baseline guides how candidate evidence is weighed — it is not a scoring rubric.
        </p>
      </div>

      <Card padding="lg">
        <SectionTitle n="01">Job description</SectionTitle>
        <Field htmlFor="jd" hint="Paste the full description. Responsibilities and required technologies improve the role profile.">
          <Textarea id="jd" rows={7} value={job.description} onChange={(e: any) => set({ description: e.target.value })} showCount maxLength={6000} />
          <FieldError errors={fieldErrors} name="description" />
        </Field>
      </Card>

      <Card padding="lg">
        <SectionTitle n="02">Seniority &amp; experience</SectionTitle>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Seniority baseline">
            <SegmentedControl options={SENIORITIES as unknown as string[]} value={job.seniority} onChange={(val: string) => set({ seniority: val as Seniority })} />
            <FieldError errors={fieldErrors} name="seniority" />
          </Field>
          <Field label="Years of experience" htmlFor="yr" optional style={{ width: 160 }}>
            <Input id="yr" type="number" min="0" placeholder="e.g. 5" value={job.yearsExperience ?? ''} onChange={(e: any) => set({ yearsExperience: e.target.value === '' ? null : Number(e.target.value) })} />
          </Field>
        </div>
      </Card>

      <Card padding="lg">
        <SectionTitle n="03" hint="Mark up to 3 primary stacks. Primary stacks focus the evidence matrix and STAR questions on what matters most for this role.">
          Tech stack
        </SectionTitle>
        <Field label="Add a technology" htmlFor="stack">
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              id="stack"
              placeholder="Type comma-separated technologies and press Enter"
              value={stackTagsText}
              onChange={(e: any) => setStackTagsText(e.target.value)}
              onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); addStackText(); } }}
            />
            <Button variant="secondary" onClick={addStackText}>Add</Button>
          </div>
        </Field>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Selected stacks
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: primaryCount >= 3 ? "var(--status-validate-fg)" : "var(--text-muted)" }}>
              {primaryCount} / 3 primary
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {job.stackTags.map((tag) => (
              <Tag key={tag} primary={job.primaryStacks.includes(tag)} removable onRemove={() => removeStack(tag)} onClick={() => togglePrimary(tag)}>
                {tag}
              </Tag>
            ))}
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Click a chip to toggle it as primary. Primary stacks are shown with a dot.
          </p>
          <FieldError errors={fieldErrors} name="primaryStacks" />
        </div>
      </Card>

      <Card padding="lg">
        <SectionTitle n="04">Recruiter notes</SectionTitle>
        <Field htmlFor="notes" optional hint="Context the analysis should keep in mind — team, constraints, what you're unsure about.">
          <Textarea id="notes" rows={3} value={job.notes} onChange={(e: any) => set({ notes: e.target.value })} placeholder="e.g. Replacing a senior who owned deployment. Backend ownership matters more than breadth." />
        </Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button variant="accent" size="lg" onClick={onContinue} disabled={job.description.trim() === ''} trailingIcon={<Icon name="arrow-right" size={17} />}>
          Continue to candidate evidence
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 2: Candidate Evidence
// ----------------------------------------------------------------------------
function PdfUpload({
  kind,
  value,
  onText,
  status,
  error,
  onStart,
  onError,
  onSuccess,
}: {
  kind: DocumentKind;
  value: string;
  onText: (text: string) => void;
  status: string | null;
  error: string | null;
  onStart: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onStart();
    try {
      const res = await extractPdfText(file, kind);
      if (res.hasText) {
        onText(mergeExtractedText(value, res.text));
        onSuccess(`Filled from PDF (${res.pages} page${res.pages === 1 ? '' : 's'}). Review before running.`);
      } else {
        onError(res.warnings[0] ?? 'No selectable text found. Paste the text manually.');
      }
    } catch (err) {
      onError(
        err instanceof ValidationError
          ? (Object.values(err.errors)[0] ?? 'Could not process the PDF.')
          : 'Could not process the PDF. Paste the text manually.',
      );
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
        <input type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={onFile} />
        <Icon name="upload" size={14} /> Upload PDF instead
      </label>
      {status && <p style={{ fontSize: 12, color: 'var(--status-info-fg)', margin: '4px 0 0' }}>{status}</p>}
      {error && <p style={{ fontSize: 12, color: 'var(--status-gap-fg)', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

export function CandidateScreen({
  state,
  dispatch,
  onBack,
  onRun,
}: {
  state: AppState;
  dispatch: Dispatch<Action>;
  onBack: () => void;
  onRun: () => void;
}) {
  const { candidate, fieldErrors } = state;
  const set = (patch: Partial<CandidateInput>) => dispatch({ type: 'setCandidate', candidate: { ...candidate, ...patch } });

  const [resumeStatus, setResumeStatus] = useState<string|null>(null);
  const [resumeError, setResumeError] = useState<string|null>(null);
  const [liStatus, setLiStatus] = useState<string|null>(null);
  const [liError, setLiError] = useState<string|null>(null);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>Add candidate evidence</h1>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
          Paste the public evidence below. Missing information simply becomes a signal to validate during the interview.
        </p>
      </div>

      <Banner tone="info" icon={<Icon name="shield-check" size={16} />} title="Privacy protected">
        Evidence is analyzed securely. We don't use this data to train models, and it isn't stored after the session closes.
      </Banner>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SourceCard title="Resume" required>
            <Textarea
              placeholder="Paste the full text of the resume"
              rows={12}
              value={candidate.resumeText}
              onChange={(e: any) => set({ resumeText: e.target.value })}
            />
            <PdfUpload
              kind="resume"
              value={candidate.resumeText}
              onText={(t) => set({ resumeText: t })}
              status={resumeStatus} error={resumeError}
              onStart={() => { setResumeError(null); setResumeStatus('Extracting...'); }}
              onError={(e) => { setResumeStatus(null); setResumeError(e); }}
              onSuccess={(s) => { setResumeError(null); setResumeStatus(s); }}
            />
            <FieldError errors={fieldErrors} name="resumeText" />
          </SourceCard>

          <SourceCard title="GitHub">
            <Input
              placeholder="https://github.com/..."
              leading={<Icon name="github" size={16} color="var(--text-muted)" />}
              value={candidate.githubUrl}
              onChange={(e: any) => set({ githubUrl: e.target.value })}
            />
          </SourceCard>

          <SourceCard title="Portfolio or Website">
            <Input
              placeholder="https://..."
              leading={<Icon name="globe" size={16} color="var(--text-muted)" />}
              value={candidate.portfolioUrl}
              onChange={(e: any) => set({ portfolioUrl: e.target.value })}
            />
          </SourceCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SourceCard title="LinkedIn Profile">
            <Textarea
              placeholder="Paste the 'Save to PDF' export text here"
              rows={12}
              value={candidate.linkedinText}
              onChange={(e: any) => set({ linkedinText: e.target.value })}
            />
            <PdfUpload
              kind="linkedin"
              value={candidate.linkedinText}
              onText={(t) => set({ linkedinText: t })}
              status={liStatus} error={liError}
              onStart={() => { setLiError(null); setLiStatus('Extracting...'); }}
              onError={(e) => { setLiStatus(null); setLiError(e); }}
              onSuccess={(s) => { setLiError(null); setLiStatus(s); }}
            />
          </SourceCard>

          <Card padding="md">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="message-square" size={16} color="var(--text-muted)" />
                <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600 }}>Recruiter notes</h3>
              </div>
            </div>
            <Textarea
              placeholder="Any context the candidate provided or your initial impressions?"
              rows={4}
              value={candidate.notes}
              onChange={(e: any) => set({ notes: e.target.value })}
            />
          </Card>
        </div>
      </div>

      <FieldError errors={fieldErrors} name="candidate" />
      {fieldErrors.body && <p style={{ color: 'var(--status-gap-fg)' }}>{fieldErrors.body}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 24 }}>
        <Button variant="ghost" onClick={onBack}>Back to Job Profile</Button>
        <Button variant="accent" size="lg" onClick={onRun}>Run Analysis</Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 3: Analysis Progress
// ----------------------------------------------------------------------------
function stageState(stages: StageEvent[], id: string): "pending" | "running" | "completed" | "warning" {
  const evs = stages.filter((s) => s.stage === id);
  if (evs.length === 0) return "pending";
  const lastEv = evs[evs.length - 1];
  if (lastEv.status === "pending") return "running";
  if (lastEv.status === "completed") return "completed";
  return "warning"; // generic fallback for failed or warnings
}

export function ProgressScreen({ state }: { state: AppState }) {
  // We can find the current running stage to display a "working on..." subtext
  const currentEv = state.stages.slice().reverse().find(s => s.status === "pending");
  const currentStage = STAGES.find(s => s.id === currentEv?.stage);

  return (
    <div style={{ maxWidth: 540, margin: "64px auto 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Icon name="loader-circle" size={24} className="tma-spin" color="var(--text-secondary)" />
      </div>

      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "-0.01em" }}>
        Analyzing technical maturity
      </h1>
      <p style={{ margin: "8px 0 32px", fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>
        {currentStage ? currentStage.name + "..." : "Connecting to reasoning engine..."}
      </p>

      <Card padding="md" style={{ width: "100%", textAlign: "left", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STAGES.map((s, i) => {
            const st = stageState(state.stages, s.id);
            return (
              <StageItem
                key={s.id}
                title={s.name}
                detail={s.detail}
                state={st}
                last={i === STAGES.length - 1}
              />
            );
          })}
        </div>
      </Card>
      {state.error && <p style={{ color: 'var(--status-gap-fg)', marginTop: 16 }}>{state.error}</p>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Screen 4: Report
// ----------------------------------------------------------------------------
export function ReportScreen({ report, analysisId, onReset }: { report: Report; analysisId: string; onReset: () => void }) {
  const byQuadrant = (q: Quadrant) => report.evidenceMatrix.filter((i) => i.quadrant === q);

  const downloadExport = async () => {
    try {
      const url = exportUrl(analysisId);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `tma-report-${analysisId}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to download export", err);
      window.open(exportUrl(analysisId), '_blank'); // fallback
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* HEADER */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <QualBadge label="Seniority Profile" value={report.seniority} tone="neutral" />
            </div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Technical Maturity Analysis
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="ghost" onClick={onReset} leadingIcon={<Icon name="refresh-ccw" size={16} />}>Start over</Button>
            <Button variant="secondary" onClick={downloadExport} leadingIcon={<Icon name="download" size={16} />}>Export Markdown</Button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.5, color: "var(--text-secondary)", maxWidth: 800 }}>
          {report.executiveSummary}
        </p>
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {report.badges.map((b, i) => (
            <StatusBadge key={i} tone={b.tone as any} variant="soft">{b.label}</StatusBadge>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border-subtle)" }} />

      {/* MATRIX */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 600 }}>Evidence matrix</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Claims cross-referenced against provided sources. Missing evidence is not a gap, just a signal to validate.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Top Row: Strong */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-sunken)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge tone="confirmed" variant="solid" dot={false} size="sm">Strong with Evidence</StatusBadge>
            </div>
            {byQuadrant("strong_with_evidence").length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>None.</p> : null}
            {byQuadrant("strong_with_evidence").map((item, i) => (
              <QuadrantCard key={i} quadrant="strong_with_evidence" title={item.title} rationale={item.rationale} source={item.sources?.[0]?.kind} interviewFocus={item.interviewFocus} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-sunken)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge tone="validate" variant="solid" dot={false} size="sm">Strong, needs validation</StatusBadge>
            </div>
            {byQuadrant("strong_needs_validation").length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>None.</p> : null}
            {byQuadrant("strong_needs_validation").map((item, i) => (
              <QuadrantCard key={i} quadrant="strong_needs_validation" title={item.title} rationale={item.rationale} source={item.sources?.[0]?.kind} interviewFocus={item.interviewFocus} />
            ))}
          </div>

          {/* Bottom Row: Weak */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-sunken)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge tone="gap" variant="solid" dot={false} size="sm">Weak with Evidence</StatusBadge>
            </div>
            {byQuadrant("weak_with_evidence").length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>None.</p> : null}
            {byQuadrant("weak_with_evidence").map((item, i) => (
              <QuadrantCard key={i} quadrant="weak_with_evidence" title={item.title} rationale={item.rationale} source={item.sources?.[0]?.kind} interviewFocus={item.interviewFocus} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-sunken)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge tone="uncertain" variant="solid" dot={false} size="sm">Weak, needs validation</StatusBadge>
            </div>
            {byQuadrant("weak_needs_validation").length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>None.</p> : null}
            {byQuadrant("weak_needs_validation").map((item, i) => (
              <QuadrantCard key={i} quadrant="weak_needs_validation" title={item.title} rationale={item.rationale} source={item.sources?.[0]?.kind} interviewFocus={item.interviewFocus} />
            ))}
          </div>
        </div>
      </div>

      {/* STAR QUESTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 600 }}>Interview plan: STAR questions</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Targeted behavioral and technical questions to validate the missing or weak evidence.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {report.starQuestions.map((q, i) => (
            <StarQuestion key={q.id} index={i+1} question={q.question} reveals={q.dimension} followUps={[]} />
          ))}
        </div>
      </div>

      {/* SUMMARIES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
        <Card padding="lg">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="users" size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600 }}>Recruiter hand-off</h3>
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5, color: "var(--text-secondary)" }}>
            {report.recruiterSummary}
          </p>
        </Card>
        <Card padding="lg">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="code" size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 600 }}>Hiring Manager notes</h3>
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5, color: "var(--text-secondary)" }}>
            {report.hiringManagerSummary}
          </p>
        </Card>
      </div>
    </div>
  );
}
