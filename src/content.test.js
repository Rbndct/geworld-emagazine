import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { issue } from './content.js';
import { validateIssue, formatReference, isPeriodicalSource, buildTOC } from './lib/magazine.js';

describe('issue content', () => {
  it('passes schema validation', () => {
    assert.deepEqual(validateIssue(issue), { valid: true, errors: [] });
  });

  it('formats every reference without throwing, keeps a url, and italicizes exactly one segment', () => {
    for (const ref of issue.references) {
      const formatted = formatReference(ref);
      assert.ok(formatted.authorYear.length > 0);
      assert.ok(formatted.title.length > 0);
      assert.ok(formatted.source.length > 0);
      assert.notEqual(formatted.titleItalic, formatted.sourceItalic, `expected exactly one italic segment for ${ref.authors}`);
      assert.ok(formatted.url, `expected a url for ${ref.authors}`);
    }
  });

  it('classifies at least one periodical and one standalone reference', () => {
    const periodicalCount = issue.references.filter((ref) => isPeriodicalSource(ref.source)).length;
    assert.ok(periodicalCount > 0, 'expected at least one periodical reference');
    assert.ok(periodicalCount < issue.references.length, 'expected at least one standalone reference');
  });

  it('builds a TOC with one unique entry per section', () => {
    const toc = buildTOC(issue.sections);
    assert.equal(toc.length, issue.sections.length);
    const ids = new Set(toc.map((entry) => entry.id));
    assert.equal(ids.size, toc.length);
  });
});
