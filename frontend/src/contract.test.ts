import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import type { Report } from './types/contract';
import { QUADRANTS, SENIORITIES } from './types/contract';
import { assertNoScoreField } from './policy';

// The single shared fixture produced from the Go contract package. This is the
// TS half of spec 001 AC1: the same fixture round-trips through both sides.
const here = fileURLToPath(new URL('.', import.meta.url));
const fixturePath = resolve(here, '../../backend/internal/contract/testdata/report.json');
const raw = readFileSync(fixturePath, 'utf-8');

describe('contract round-trip (shared Go fixture)', () => {
  it('parses into the TS Report shape with all sections present', () => {
    const report = JSON.parse(raw) as Report;
    expect(report.executiveSummary).toBeTruthy();
    expect(report.recruiterSummary).toBeTruthy();
    expect(report.hiringManagerSummary).toBeTruthy();
    expect(Array.isArray(report.evidenceMatrix)).toBe(true);
    expect(Array.isArray(report.badges)).toBe(true);
    expect(Array.isArray(report.starQuestions)).toBe(true);
    expect(Array.isArray(report.methodology)).toBe(true);
    expect(Array.isArray(report.limitations)).toBe(true);
    expect(report.evidenceMatrix.length).toBeGreaterThan(0);
  });

  it('re-serializes identically (stable round-trip)', () => {
    const report = JSON.parse(raw) as Report;
    expect(JSON.parse(JSON.stringify(report))).toEqual(report);
  });

  it('uses only known enum values', () => {
    const report = JSON.parse(raw) as Report;
    expect(SENIORITIES).toContain(report.seniority);
    for (const item of report.evidenceMatrix) {
      expect(QUADRANTS).toContain(item.quadrant);
    }
  });

  it('carries no score-like field', () => {
    expect(() => assertNoScoreField(JSON.parse(raw))).not.toThrow();
  });
});
