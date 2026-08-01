import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  buildTOC,
  formatReference,
  truncateForTeaser,
  validateIssue,
} from './magazine.js';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    assert.equal(slugify('The Geopolitics Beneath the Security Narrative'), 'the-geopolitics-beneath-the-security-narrative');
  });

  it('strips punctuation', () => {
    assert.equal(slugify("From Bilateral Contest to Regional Alignment: The Philippine Case"), 'from-bilateral-contest-to-regional-alignment-the-philippine-case');
  });

  it('collapses repeated whitespace/hyphens', () => {
    assert.equal(slugify('Impact / Solution /  Conclusion'), 'impact-solution-conclusion');
  });

  it('trims leading and trailing hyphens', () => {
    assert.equal(slugify('  -- Background --  '), 'background');
  });
});

describe('buildTOC', () => {
  it('builds one entry per section with slugified ids', () => {
    const sections = [{ title: 'Background' }, { title: 'Main Analysis' }];
    assert.deepEqual(buildTOC(sections), [
      { id: 'background', title: 'Background' },
      { id: 'main-analysis', title: 'Main Analysis' },
    ]);
  });

  it('dedupes colliding ids by appending a counter', () => {
    const sections = [{ title: 'Solution' }, { title: 'Solution' }];
    assert.deepEqual(buildTOC(sections), [
      { id: 'solution', title: 'Solution' },
      { id: 'solution-2', title: 'Solution' },
    ]);
  });

  it('returns an empty array for no sections', () => {
    assert.deepEqual(buildTOC([]), []);
  });
});

describe('formatReference', () => {
  it('formats an author/year/title/source reference with a link when url present', () => {
    const ref = {
      authors: 'Gray, J. E.',
      year: '2021',
      title: "The geopolitics of 'platforms': The TikTok challenge",
      source: 'Internet Policy Review, 10(2)',
      url: 'https://doi.org/10.14763/2021.2.1557',
    };
    assert.deepEqual(formatReference(ref), {
      text: "Gray, J. E. (2021). The geopolitics of 'platforms': The TikTok challenge. Internet Policy Review, 10(2).",
      url: 'https://doi.org/10.14763/2021.2.1557',
    });
  });

  it('omits url when not present', () => {
    const ref = { authors: 'Wang, J.', year: '2020', title: 'From banning to regulating TikTok', source: 'Centre for Socio-Legal Studies' };
    assert.deepEqual(formatReference(ref), {
      text: 'Wang, J. (2020). From banning to regulating TikTok. Centre for Socio-Legal Studies.',
      url: null,
    });
  });

  it('throws when required fields are missing', () => {
    assert.throws(() => formatReference({ authors: 'Wang, J.' }), /year/);
  });
});

describe('truncateForTeaser', () => {
  it('returns text unchanged when shorter than the limit', () => {
    assert.equal(truncateForTeaser('Short text.', 50), 'Short text.');
  });

  it('truncates at a word boundary and appends an ellipsis', () => {
    const text = 'TikTok now sits at the center of a geopolitical contest between the United States and China.';
    assert.equal(truncateForTeaser(text, 40), 'TikTok now sits at the center of a…');
  });

  it('treats a non-positive max length as an empty teaser', () => {
    assert.equal(truncateForTeaser('Anything', 0), '');
  });
});

describe('validateIssue', () => {
  it('accepts a well-formed issue', () => {
    const issue = {
      title: 'Geopolitics of Social Media Platforms',
      slug: 'tiktok-geopolitics',
      sections: [{ id: 'background', title: 'Background', body: 'text' }],
    };
    assert.deepEqual(validateIssue(issue), { valid: true, errors: [] });
  });

  it('collects errors for missing title, slug, and empty sections', () => {
    const result = validateIssue({ sections: [] });
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, [
      'missing title',
      'missing slug',
      'sections must be a non-empty array',
    ]);
  });

  it('flags a section missing required fields', () => {
    const issue = { title: 'T', slug: 's', sections: [{ title: 'Only a title' }] };
    const result = validateIssue(issue);
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, ['section 0 is missing: id, body']);
  });
});
