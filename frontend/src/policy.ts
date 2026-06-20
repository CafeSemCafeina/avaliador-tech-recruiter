// Frontend policy guard (spec 004): the UI must never display a numeric fit
// value or a score-like field, even if one somehow appears in the payload
// (ADR-0002). This mirrors the backend eval rules as a lightweight client-side
// defense applied to the report before it is rendered.

const SCORE_KEYS = ['score', 'rating', 'fit', 'percentage'];

const NUMERIC_FIT = /\b\d{1,3}\s*%|\b\d{1,3}\s*\/\s*(?:100|10|5)\b/;

/**
 * Recursively asserts an object graph contains no score-like key. Throws if one
 * is found, so a non-compliant payload fails loudly rather than rendering a
 * disguised score.
 */
export function assertNoScoreField(value: unknown, path = ''): void {
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoScoreField(v, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (SCORE_KEYS.includes(key.toLowerCase())) {
        throw new Error(`forbidden score-like field "${key}" at ${path || '<root>'}`);
      }
      assertNoScoreField(v, path ? `${path}.${key}` : key);
    }
  }
}

/** Reports whether a string contains a numeric fit/score value. */
export function hasNumericFit(text: string): boolean {
  return NUMERIC_FIT.test(text);
}
