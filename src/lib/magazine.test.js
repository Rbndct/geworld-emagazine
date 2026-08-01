import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  buildTOC,
  isPeriodicalSource,
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

describe('isPeriodicalSource', () => {
  it('recognizes a journal name with volume and issue', () => {
    assert.equal(isPeriodicalSource('Internet Policy Review, 10(2)'), true);
  });

  it('recognizes a journal name with volume, issue, and pages', () => {
    assert.equal(isPeriodicalSource('Washington University Global Studies Law Review, 21(2), 273–'), true);
  });

  it('recognizes a journal name with a volume but no issue number', () => {
    assert.equal(isPeriodicalSource('Journal of Information Policy, 14, 417–470'), true);
  });

  it('treats a bare organization or site name as non-periodical', () => {
    assert.equal(isPeriodicalSource('GMA News Online'), false);
    assert.equal(isPeriodicalSource('Freedom House'), false);
    assert.equal(isPeriodicalSource('Encyclopedia Britannica'), false);
  });
});

describe('formatReference', () => {
  it('italicizes the source (journal + volume/issue) for a periodical reference', () => {
    const ref = {
      authors: 'Gray, J. E.',
      year: '2021',
      title: "The geopolitics of 'platforms': The TikTok challenge",
      source: 'Internet Policy Review, 10(2)',
      url: 'https://doi.org/10.14763/2021.2.1557',
    };
    assert.deepEqual(formatReference(ref), {
      authorYear: 'Gray, J. E. (2021).',
      title: "The geopolitics of 'platforms': The TikTok challenge.",
      titleItalic: false,
      source: 'Internet Policy Review, 10(2).',
      sourceItalic: true,
      url: 'https://doi.org/10.14763/2021.2.1557',
    });
  });

  it('italicizes the title (not the source) for a standalone reference', () => {
    const ref = {
      authors: 'GMA News Online',
      year: '2023',
      title: 'NSA Año: PH TikTok ban possible if app proven to be used for espionage',
      source: 'GMA News Online',
      url: 'https://example.com/story',
    };
    assert.deepEqual(formatReference(ref), {
      authorYear: 'GMA News Online (2023).',
      title: 'NSA Año: PH TikTok ban possible if app proven to be used for espionage.',
      titleItalic: true,
      source: 'GMA News Online.',
      sourceItalic: false,
      url: 'https://example.com/story',
    });
  });

  it('omits url when not present', () => {
    const ref = { authors: 'Wang, J.', year: '2020', title: 'From banning to regulating TikTok', source: 'Centre for Socio-Legal Studies' };
    assert.deepEqual(formatReference(ref), {
      authorYear: 'Wang, J. (2020).',
      title: 'From banning to regulating TikTok.',
      titleItalic: true,
      source: 'Centre for Socio-Legal Studies.',
      sourceItalic: false,
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
