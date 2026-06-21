// HTTP client for the analysis API. The UI renders from the structured Report
// JSON returned here — never from the Markdown export.
import type { CandidateInput, JobInput, Report, StageEvent } from './types/contract';
import { assertNoScoreField } from './policy';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

export interface FieldErrors {
  [field: string]: string;
}

export class ValidationError extends Error {
  errors: FieldErrors;
  constructor(errors: FieldErrors) {
    super('validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/** Creates an analysis and returns its id, or throws ValidationError on 400. */
export async function createAnalysis(job: JobInput, candidate: CandidateInput): Promise<string> {
  const res = await fetch(`${BASE}/api/analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job, candidate }),
  });
  if (res.status === 400) {
    const body = (await res.json()) as { errors?: FieldErrors };
    throw new ValidationError(body.errors ?? { body: 'invalid input' });
  }
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
  const body = (await res.json()) as { analysisId: string };
  return body.analysisId;
}

/** Opens an SSE stream of stage events. Returns a close function. */
export function streamEvents(
  id: string,
  onEvent: (ev: StageEvent) => void,
  onClose: () => void,
): () => void {
  const es = new EventSource(`${BASE}/api/analyses/${id}/events`);
  es.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data) as StageEvent);
    } catch {
      // ignore malformed frames
    }
  };
  es.onerror = () => {
    // The server closes the stream on terminal state, which surfaces as an
    // error event in EventSource; treat it as a clean close.
    es.close();
    onClose();
  };
  return () => es.close();
}

/** Fetches the completed report, asserting it carries no score-like field. */
export async function fetchReport(id: string): Promise<Report> {
  const res = await fetch(`${BASE}/api/analyses/${id}`);
  if (!res.ok) throw new Error(`status failed: ${res.status}`);
  const body = (await res.json()) as { state: string; report?: Report; error?: string };
  if (body.state === 'failed') throw new Error(body.error || 'analysis failed');
  if (!body.report) throw new Error('report not ready');
  assertNoScoreField(body.report);
  return body.report;
}

/** URL of the Markdown export for a completed analysis. */
export function exportUrl(id: string): string {
  return `${BASE}/api/analyses/${id}/export.md`;
}

export type DocumentKind = 'resume' | 'linkedin';

export interface PdfExtraction {
  text: string;
  pages: number;
  hasText: boolean;
  warnings: string[];
}

/**
 * Uploads a PDF and returns its extracted text. The bytes are never sent to the
 * analysis pipeline — only the returned text fills the evidence textareas.
 * Throws ValidationError on a bounded 4xx (too large, not a PDF, missing file).
 */
export async function extractPdfText(file: File, kind: DocumentKind): Promise<PdfExtraction> {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  const res = await fetch(`${BASE}/api/documents/extract-text`, { method: 'POST', body: form });
  if (res.status === 400 || res.status === 413) {
    const body = (await res.json()) as { errors?: FieldErrors };
    throw new ValidationError(body.errors ?? { file: 'could not process the PDF' });
  }
  if (!res.ok) throw new Error(`extract failed: ${res.status}`);
  return (await res.json()) as PdfExtraction;
}

/**
 * Fills an evidence textarea with extracted PDF text: appends (with a blank
 * line) to existing content rather than overwriting what the user already typed.
 */
export function mergeExtractedText(existing: string, extracted: string): string {
  const a = existing.trim();
  const b = extracted.trim();
  if (!a) return b;
  if (!b) return a;
  return `${a}\n\n${b}`;
}
