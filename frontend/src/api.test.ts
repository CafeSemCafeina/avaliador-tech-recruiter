// Offline tests for the PDF upload helper and the textarea fill-in logic
// (spec 011). fetch is mocked — no network, no live backend.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractPdfText, mergeExtractedText, ValidationError } from './api';

function mockFetch(status: number, body: unknown) {
  return vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

const pdfFile = () => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'r.pdf', { type: 'application/pdf' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('extractPdfText', () => {
  it('returns extracted text on 200 (AC4/AC5: fills the field)', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { text: 'Senior Go engineer', pages: 1, hasText: true, warnings: [] }));
    const res = await extractPdfText(pdfFile(), 'resume');
    expect(res.hasText).toBe(true);
    expect(res.text).toBe('Senior Go engineer');
  });

  it('surfaces the no-text warning without throwing (AC2)', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { text: '', pages: 1, hasText: false, warnings: ['No selectable text found in this PDF.'] }));
    const res = await extractPdfText(pdfFile(), 'linkedin');
    expect(res.hasText).toBe(false);
    expect(res.warnings[0]).toMatch(/no selectable text/i);
  });

  it('throws ValidationError with a field message on 4xx (AC3)', async () => {
    vi.stubGlobal('fetch', mockFetch(413, { errors: { file: 'file exceeds the 10 MB limit' } }));
    await expect(extractPdfText(pdfFile(), 'resume')).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('mergeExtractedText', () => {
  it('fills an empty field with the extracted text (AC4)', () => {
    expect(mergeExtractedText('', 'Resume body')).toBe('Resume body');
  });

  it('appends to existing content rather than overwriting (AC5)', () => {
    expect(mergeExtractedText('Typed notes', 'PDF body')).toBe('Typed notes\n\nPDF body');
  });

  it('keeps existing content when the extraction is empty', () => {
    expect(mergeExtractedText('Typed notes', '   ')).toBe('Typed notes');
  });

  it('introduces no score/ranking/verdict wording', () => {
    const out = mergeExtractedText('a', 'b');
    expect(out).not.toMatch(/score|ranking|verdict|hire|reject/i);
  });
});
