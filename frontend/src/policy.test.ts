import { describe, expect, it } from 'vitest';
import { assertNoScoreField, hasNumericFit } from './policy';

describe('frontend policy guard (spec 004)', () => {
  it('rejects a score-like field anywhere in the payload', () => {
    expect(() => assertNoScoreField({ report: { score: 88 } })).toThrow();
    expect(() => assertNoScoreField({ items: [{ rating: 5 }] })).toThrow();
    expect(() => assertNoScoreField({ fit: 0.9 })).toThrow();
    expect(() => assertNoScoreField({ percentage: 70 })).toThrow();
  });

  it('accepts a compliant object', () => {
    expect(() =>
      assertNoScoreField({ executiveSummary: 'ok', items: [{ title: 't', sources: [] }] }),
    ).not.toThrow();
  });

  it('detects numeric fit values but not ordinary counts', () => {
    expect(hasNumericFit('overall 85%')).toBe(true);
    expect(hasNumericFit('scored 8/10')).toBe(true);
    expect(hasNumericFit('two evidenced signals')).toBe(false);
    expect(hasNumericFit('3 interview questions')).toBe(false);
  });
});
