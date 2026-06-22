// The four screens (Job Input -> Candidate Evidence -> Analysis Progress ->
// Report), rendered from reducer state and the structured Report JSON. Copy is
// conservative and uncertainty-preserving; nothing here shows a score, ranking,
// or verdict (ADR-0002).
import { useState } from 'react';
import type { ChangeEvent, Dispatch } from 'react';
import type {
  CandidateInput,
  Finding,
  JobInput,
  Quadrant,
  QuadrantItem,
  Report,
  Seniority,
  Source,
  StageEvent,
  ValidationItem,
} from './types/contract';
import { SENIORITIES } from './types/contract';
import type { Action, AppState } from './state';
import type { DocumentKind, FieldErrors } from './api';
import { exportUrl, extractPdfText, mergeExtractedText, ValidationError } from './api';
import { formatStackTags, parseStackTagsInput } from './stackTags';

const STAGES: { id: string; name: string }[] = [
  { id: 'parse_resume', name: 'Parsing resume' },
  { id: 'job_profile', name: 'Extracting role maturity profile' },
  { id: 'linkedin_evidence', name: 'Reading LinkedIn evidence' },
  { id: 'github_evidence', name: 'Analyzing GitHub repositories' },
  { id: 'portfolio_evidence', name: 'Reading portfolio signals' },
  { id: 'evidence_checker', name: 'Checking claims against evidence' },
  { id: 'evidence_matrix', name: 'Building evidence matrix' },
  { id: 'star_questions', name: 'Generating STAR questions' },
  { id: 'analyst_review', name: 'Running analyst self-review' },
  { id: 'finalize', name: 'Finalizing report' },
];

const QUADRANT_META: Record<Quadrant, { label: string; status: string }> = {
  strong_with_evidence: { label: 'Strong with evidence', status: 'confirmed' },
  strong_needs_validation: { label: 'Strong, needs validation', status: 'validate' },
  weak_with_evidence: { label: 'Weak with evidence', status: 'gap' },
  weak_needs_validation: { label: 'Weak, needs validation', status: 'uncertain' },
};

function FieldError({ errors, name }: { errors: FieldErrors; name: string }) {
  if (!errors[name]) return null;
  return <p className="field-error">{errors[name]}</p>;
}

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

  const togglePrimary = (tag: string) => {
    const has = job.primaryStacks.includes(tag);
    if (has) {
      set({ primaryStacks: job.primaryStacks.filter((t) => t !== tag) });
    } else if (job.primaryStacks.length < 3) {
      set({ primaryStacks: [...job.primaryStacks, tag] });
    }
  };

  return (
    <section className="card">
      <p className="tma-eyebrow">Step 1 of 4</p>
      <h1>Define the role baseline</h1>

      <label className="field">
        <span>Role description</span>
        <textarea
          rows={5}
          value={job.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="What the role is responsible for, the team, and the stack."
        />
      </label>

      <div className="row">
        <label className="field">
          <span>Seniority</span>
          <select value={job.seniority} onChange={(e) => set({ seniority: e.target.value as Seniority })}>
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError errors={fieldErrors} name="seniority" />
        </label>

        <label className="field">
          <span>Years of experience (optional)</span>
          <input
            type="number"
            min={0}
            value={job.yearsExperience ?? ''}
            onChange={(e) => set({ yearsExperience: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="field">
        <span>Stack tags (comma separated)</span>
        <input
          value={stackTagsText}
          onChange={(e) => {
            const nextText = e.target.value;
            const stackTags = parseStackTagsInput(nextText);
            setStackTagsText(nextText);
            set({
              stackTags,
              primaryStacks: job.primaryStacks.filter((tag) => stackTags.includes(tag)),
            });
          }}
          onBlur={() => setStackTagsText(formatStackTags(job.stackTags))}
          placeholder="React, TypeScript, Go"
        />
      </label>

      {job.stackTags.length > 0 && (
        <div className="field">
          <span className="tma-eyebrow">Primary stacks (up to 3)</span>
          <div className="chips">
            {job.stackTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={'chip' + (job.primaryStacks.includes(tag) ? ' chip-on' : '')}
                onClick={() => togglePrimary(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <FieldError errors={fieldErrors} name="primaryStacks" />
        </div>
      )}

      <label className="field">
        <span>Notes (optional)</span>
        <textarea rows={2} value={job.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>

      <div className="actions">
        <button className="btn-primary" onClick={onContinue} disabled={job.description.trim() === ''}>
          Continue to candidate evidence
        </button>
      </div>
    </section>
  );
}

// PdfUpload fills an evidence textarea from an uploaded PDF. The paste path
// remains the fallback; copy stays conservative (no score/verdict wording).
function PdfUpload({
  kind,
  label,
  value,
  onText,
}: {
  kind: DocumentKind;
  label: string;
  value: string;
  onText: (text: string) => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setStatus('Extracting text…');
    try {
      const res = await extractPdfText(file, kind);
      if (res.hasText) {
        onText(mergeExtractedText(value, res.text));
        setStatus(`Filled from PDF (${res.pages} page${res.pages === 1 ? '' : 's'}). Review before running.`);
      } else {
        setStatus(res.warnings[0] ?? 'No selectable text found. Paste the text manually.');
      }
    } catch (err) {
      setStatus(null);
      setError(
        err instanceof ValidationError
          ? (Object.values(err.errors)[0] ?? 'Could not process the PDF.')
          : 'Could not process the PDF. Paste the text manually.',
      );
    }
  };

  return (
    <div className="upload">
      <label className="upload-btn">
        <input type="file" accept="application/pdf,.pdf" onChange={onFile} />
        <span>Upload {label} PDF</span>
      </label>
      {status && <span className="upload-status muted">{status}</span>}
      {error && <span className="field-error">{error}</span>}
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
  const set = (patch: Partial<CandidateInput>) =>
    dispatch({ type: 'setCandidate', candidate: { ...candidate, ...patch } });

  return (
    <section className="card">
      <p className="tma-eyebrow">Step 2 of 4</p>
      <h1>Add candidate evidence</h1>
      <p className="muted">Paste the public evidence. Anything not provided becomes an interview-validation item, not a gap.</p>

      <label className="field">
        <span>Resume text</span>
        <textarea rows={6} value={candidate.resumeText} onChange={(e) => set({ resumeText: e.target.value })} />
      </label>
      <PdfUpload kind="resume" label="resume" value={candidate.resumeText} onText={(t) => set({ resumeText: t })} />
      <label className="field">
        <span>LinkedIn text (optional)</span>
        <textarea rows={3} value={candidate.linkedinText} onChange={(e) => set({ linkedinText: e.target.value })} />
      </label>
      <PdfUpload kind="linkedin" label="LinkedIn" value={candidate.linkedinText} onText={(t) => set({ linkedinText: t })} />
      <div className="row">
        <label className="field">
          <span>GitHub URL (optional)</span>
          <input value={candidate.githubUrl} onChange={(e) => set({ githubUrl: e.target.value })} placeholder="https://github.com/…" />
        </label>
        <label className="field">
          <span>Portfolio URL (optional)</span>
          <input value={candidate.portfolioUrl} onChange={(e) => set({ portfolioUrl: e.target.value })} placeholder="https://…" />
        </label>
      </div>
      <label className="field">
        <span>Notes (optional)</span>
        <textarea rows={2} value={candidate.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>

      <FieldError errors={fieldErrors} name="candidate" />
      {fieldErrors.body && <p className="field-error">{fieldErrors.body}</p>}

      <div className="actions">
        <button className="btn-ghost" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={onRun}>
          Run analysis
        </button>
      </div>
    </section>
  );
}

function stageStatus(stages: StageEvent[], id: string): string {
  const ev = stages.find((s) => s.stage === id);
  return ev ? ev.status : 'pending';
}

export function ProgressScreen({ state }: { state: AppState }) {
  return (
    <section className="card">
      <p className="tma-eyebrow">Step 3 of 4</p>
      <h1>Analyzing evidence</h1>
      <ol className="stages">
        {STAGES.map((s) => {
          const status = stageStatus(state.stages, s.id);
          return (
            <li key={s.id} className={'stage stage-' + status}>
              <span className="stage-dot" aria-hidden />
              <span>{s.name}</span>
              <span className="stage-status">{status}</span>
            </li>
          );
        })}
      </ol>
      {state.error && <p className="field-error">{state.error}</p>}
    </section>
  );
}

function Sources({ sources }: { sources?: Source[] }) {
  if (!sources || sources.length === 0) return <p className="sources muted">Not yet evidenced — for interview validation.</p>;
  return (
    <ul className="sources">
      {sources.map((s, i) => (
        <li key={i}>
          <span className="tma-mono source-kind">{s.kind}</span> {s.detail}
        </li>
      ))}
    </ul>
  );
}

function MatrixCard({ item }: { item: QuadrantItem }) {
  const meta = QUADRANT_META[item.quadrant];
  return (
    <article className={'matrix-item status-' + meta.status}>
      <h4>{item.title}</h4>
      <p>{item.rationale}</p>
      <Sources sources={item.sources} />
      <p className="interview">
        <span className="tma-eyebrow">Interview focus</span> {item.interviewFocus}
      </p>
    </article>
  );
}

export function ReportScreen({ report, analysisId, onReset }: { report: Report; analysisId: string; onReset: () => void }) {
  const byQuadrant = (q: Quadrant) => report.evidenceMatrix.filter((i) => i.quadrant === q);
  return (
    <section className="report">
      <header className="card">
        <p className="tma-eyebrow">Step 4 of 4 · Seniority profile: {report.seniority}</p>
        <h1>Technical maturity analysis</h1>
        <p>{report.executiveSummary}</p>
        <div className="badges">
          {report.badges.map((b, i) => (
            <span key={i} className={'badge tone-' + b.tone}>
              {b.label}
            </span>
          ))}
        </div>
        <div className="actions">
          <a className="btn-primary" href={exportUrl(analysisId)} target="_blank" rel="noreferrer">
            Export Markdown
          </a>
          <button className="btn-ghost" onClick={onReset}>
            Start over
          </button>
        </div>
      </header>

      <div className="card">
        <h2>Evidence matrix</h2>
        <div className="matrix">
          {(Object.keys(QUADRANT_META) as Quadrant[]).map((q) => (
            <div key={q} className="matrix-col">
              <h3 className={'status-head status-' + QUADRANT_META[q].status}>{QUADRANT_META[q].label}</h3>
              {byQuadrant(q).length === 0 ? (
                <p className="muted">None.</p>
              ) : (
                byQuadrant(q).map((it, i) => <MatrixCard key={i} item={it} />)
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <FindingList title="Confirmed strengths" findings={report.confirmedStrengths} />
        <ValidationList title="Strengths needing validation" items={report.strengthsNeedingValidation} />
        <FindingList title="Confirmed gaps" findings={report.confirmedGaps} />
        <ValidationList title="Weak signals needing validation" items={report.weakSignalsNeedingValidation} />
      </div>

      <div className="card">
        <h2>STAR interview questions</h2>
        <ul className="star">
          {report.starQuestions.map((q) => (
            <li key={q.id}>
              <span className="tma-eyebrow">{q.dimension}</span>
              <p>{q.question}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card two-col">
        <div>
          <h2>Recruiter summary</h2>
          <p>{report.recruiterSummary}</p>
        </div>
        <div>
          <h2>Hiring manager summary</h2>
          <p>{report.hiringManagerSummary}</p>
        </div>
      </div>

      <div className="card">
        <h2>Methodology</h2>
        <ul className="methodology">
          {report.methodology.map((m, i) => (
            <li key={i}>
              {m.name} — {m.status}
            </li>
          ))}
        </ul>
        <h2>Limitations</h2>
        <ul>
          {report.limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FindingList({ title, findings }: { title: string; findings: Finding[] }) {
  return (
    <div className="block">
      <h3>{title}</h3>
      {findings.length === 0 ? (
        <p className="muted">None.</p>
      ) : (
        <ul>
          {findings.map((f, i) => (
            <li key={i}>
              {f.statement}
              <Sources sources={f.sources} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ValidationList({ title, items }: { title: string; items: ValidationItem[] }) {
  return (
    <div className="block">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="muted">None.</p>
      ) : (
        <ul>
          {items.map((v, i) => (
            <li key={i}>
              {v.statement}
              <p className="interview">
                <span className="tma-eyebrow">Interview focus</span> {v.interviewFocus}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
