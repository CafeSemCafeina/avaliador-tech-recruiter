export function parseStackTagsInput(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of value.split(/[,\n;]/)) {
    const tag = raw.trim();
    if (tag === '' || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }

  return tags;
}

export function formatStackTags(tags: string[]): string {
  return tags.join(', ');
}
