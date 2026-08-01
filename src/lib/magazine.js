const REFERENCE_FIELDS = ['authors', 'year', 'title', 'source'];
const SECTION_FIELDS = ['id', 'title', 'body'];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildTOC(sections) {
  const seen = new Map();
  return sections.map((section) => {
    const base = slugify(section.title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    return { id, title: section.title };
  });
}

export function formatReference(ref) {
  for (const field of REFERENCE_FIELDS) {
    if (!ref[field]) {
      throw new Error(`missing ${field}`);
    }
  }
  return {
    text: `${ref.authors} (${ref.year}). ${ref.title}. ${ref.source}.`,
    url: ref.url ?? null,
  };
}

export function truncateForTeaser(text, maxLen) {
  if (maxLen <= 0) return '';
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trim()}…`;
}

export function validateIssue(issue) {
  const errors = [];
  if (!issue.title) errors.push('missing title');
  if (!issue.slug) errors.push('missing slug');
  if (!Array.isArray(issue.sections) || issue.sections.length === 0) {
    errors.push('sections must be a non-empty array');
  } else {
    issue.sections.forEach((section, index) => {
      const missing = SECTION_FIELDS.filter((field) => !section[field]);
      if (missing.length > 0) {
        errors.push(`section ${index} is missing: ${missing.join(', ')}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
