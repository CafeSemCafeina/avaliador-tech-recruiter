import { describe, expect, it } from 'vitest';
import { formatStackTags, parseStackTagsInput } from './stackTags';

describe('stack tag input helpers', () => {
  it('parses comma-separated tags without losing typed delimiters at the UI boundary', () => {
    expect(parseStackTagsInput('React, TypeScript, Go')).toEqual(['React', 'TypeScript', 'Go']);
  });

  it('accepts semicolons and new lines as forgiving separators', () => {
    expect(parseStackTagsInput('React; TypeScript\nGo')).toEqual(['React', 'TypeScript', 'Go']);
  });

  it('trims empty values and removes case-insensitive duplicates', () => {
    expect(parseStackTagsInput(' React, react, , Go ')).toEqual(['React', 'Go']);
  });

  it('formats normalized tags for existing state', () => {
    expect(formatStackTags(['React', 'TypeScript', 'Go'])).toBe('React, TypeScript, Go');
  });
});
