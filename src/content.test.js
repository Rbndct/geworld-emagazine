import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { issue } from './content.js';
import { validateIssue, formatReference, buildTOC } from './lib/magazine.js';

describe('issue content', () => {
  it('passes schema validation', () => {
    assert.deepEqual(validateIssue(issue), { valid: true, errors: [] });
  });

  it('formats every reference without throwing and keeps a url', () => {
    for (const ref of issue.references) {
      const formatted = formatReference(ref);
      assert.ok(formatted.text.length > 0);
      assert.ok(formatted.url, `expected a url for ${ref.authors}`);
    }
  });

  it('builds a TOC with one unique entry per section', () => {
    const toc = buildTOC(issue.sections);
    assert.equal(toc.length, issue.sections.length);
    const ids = new Set(toc.map((entry) => entry.id));
    assert.equal(ids.size, toc.length);
  });
});
