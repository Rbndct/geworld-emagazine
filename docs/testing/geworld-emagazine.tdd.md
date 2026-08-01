# TDD Evidence Report: GEWORLD E-Magazine

**Source plan**: inline `/plan` output from this session ("Implementation Plan: GEWORLD E-Magazine"), no `*.plan.md` file was produced.

## User journeys

1. As a reader, I want the cover page to show a table of contents linking into each section of the article, so I can jump directly to what interests me.
2. As a reader, I want reference citations formatted consistently and linkable, so I can verify sources.
3. As a site maintainer, I want each issue's content validated (title, slug, non-empty sections with required fields) so a malformed content entry doesn't silently break the page.
4. As a reader, I want a short teaser excerpt on the cover derived from the article body, so I get a preview before clicking in.
5. As a reader, I want the interface to feel alive when browsing/clicking (scroll-reveal, a reading progress bar, smoother hover states), so long-form reading feels less static — added per the `/plan` → `/goal` request "add motion / make the interfaces more interactive."
6. As a reader who is sensitive to motion, I want all of the above disabled when `prefers-reduced-motion: reduce` is set, so the site doesn't cause discomfort.
7. As a reader, I want long body paragraphs justified with hyphenation (falling back to left-align on narrow phones) so the article reads like a typeset magazine, not a raw text dump.
8. As a reader checking sources, I want the reference list to look like a real APA 7th-edition list: hanging indent, and italics on the correct segment (journal + volume for periodicals, the work's own title for standalone sources like news sites or reports).
9. As a reader, I want the "Tab 3" internal label gone from the public landing page (it stays on the article page itself, where it functions as a section kicker).
10. As a reader, I want the article's subtitle to read as naturally written, not machine-generated — the one AI tell (an em dash) was removed via the `/humanizer` skill.

## Task report

| Task | Summary | Validation command | Result |
|---|---|---|---|
| `slugify` / `buildTOC` | Deterministic, collision-safe anchor ids for section headings | `npm test` | RED (`ERR_MODULE_NOT_FOUND`) → GREEN (16/16 pass) |
| `formatReference` | Author/year/title/source formatting, throws on missing required field | `npm test` | GREEN, covered by dedicated `describe('formatReference', …)` block |
| `truncateForTeaser` | Word-boundary truncation with ellipsis, handles short text and non-positive limits | `npm test` | GREEN |
| `validateIssue` | Structural validation of an issue object, aggregates all errors | `npm test` | GREEN |
| Real content data (`src/content.js`) | Validated against the same schema, every reference formats without throwing | `npm test` (`src/content.test.js`) | GREEN (19/19 pass total) |
| Cover + article pages | Render content data into the DOM, verified live in a browser | Playwright navigation + accessibility snapshot at desktop and 390px mobile width | PASS — no console errors, no horizontal overflow, all 7 TOC entries and 16 references rendered correctly |
| `clamp` / `computeReadingProgress` / `staggerDelay` | Pure math for the reveal stagger and reading-progress bar | `npm test` | RED (`ERR_MODULE_NOT_FOUND`) → GREEN (12/12 pass) |
| `assets/js/motion.js` scroll-reveal | Bounding-rect check re-run on every scroll/resize frame, not a one-shot `IntersectionObserver` crossing | Playwright: jumped to bottom, confirmed sections above the fold stayed pending; scrolled back up, confirmed they revealed correctly | PASS after a design fix (see below) |
| `prefers-reduced-motion: reduce` | All motion collapses to instant/static | `page.emulateMedia({ reducedMotion: 'reduce' })` via Playwright | PASS — opacity 1 immediately, transition duration ~0, `scroll-behavior: auto` |
| `isPeriodicalSource` / restructured `formatReference` | Classifies a reference as periodical (italicize journal+volume) vs. standalone (italicize the work's own title) | `npm test` | RED (missing export) → GREEN (37/37 pass, all 16 real references classified with exactly one italic segment) |
| Justified body text + hanging-indent references | Visual typography verified against the real content | Playwright: computed style checks on live pages | PASS — `.section p` is `justify`/`hyphens:auto` on desktop, falls back to `left` under 30rem; Gray (periodical) reference italicizes `"Internet Policy Review, 10(2)."`; Rhoden-Paul/BBC (standalone) reference italicizes the title instead; both show `text-indent: -29.44px` hanging indent |
| Landing-page kicker removal | "Tab 3" removed from `index.html` hero, unchanged on the article page | Playwright accessibility snapshot | PASS — cover hero no longer contains "Tab 3"; article page's `#article-kicker` still reads "Tab 3" |

## Test specification

| # | What is guaranteed | Test file | Type | Result |
|---|--------------------|-----------|------|--------|
| 1 | Slugify lowercases, hyphenates, strips punctuation, trims stray hyphens | `src/lib/magazine.test.js` | unit | PASS |
| 2 | `buildTOC` produces one id per section and de-dupes collisions | `src/lib/magazine.test.js` | unit | PASS |
| 3 | `formatReference` builds a correctly punctuated citation and passes through `url` (or `null`) | `src/lib/magazine.test.js` | unit | PASS |
| 4 | `formatReference` throws naming the first missing required field | `src/lib/magazine.test.js` | unit | PASS |
| 5 | `truncateForTeaser` leaves short text untouched, cuts long text at a word boundary with an ellipsis, and treats `maxLen <= 0` as empty | `src/lib/magazine.test.js` | unit | PASS |
| 6 | `validateIssue` accepts a well-formed issue and aggregates all missing-field errors otherwise | `src/lib/magazine.test.js` | unit | PASS |
| 7 | The real GEWORLD issue object satisfies the schema | `src/content.test.js` | integration | PASS |
| 8 | Every reference in the real content formats without throwing and carries a url | `src/content.test.js` | integration | PASS |
| 9 | The real content's TOC has one unique entry per section | `src/content.test.js` | integration | PASS |
| 10 | `clamp` bounds a value to `[min, max]` on both sides | `src/lib/motion.test.js` | unit | PASS |
| 11 | `computeReadingProgress` returns 0 at the top, 100 at the bottom, a proportional value between, 100 when content is shorter than the viewport, and clamps out-of-range input | `src/lib/motion.test.js` | unit | PASS |
| 12 | `staggerDelay` scales linearly with index and caps at `maxMs`, with sensible defaults | `src/lib/motion.test.js` | unit | PASS |
| 13 | `isPeriodicalSource` recognizes "Name, Vol(Issue)" and "Name, Vol, pages" patterns as periodical; bare org/site names as non-periodical | `src/lib/magazine.test.js` | unit | PASS |
| 14 | `formatReference` italicizes the source for a periodical, the title for a standalone reference, with correct punctuation on each segment | `src/lib/magazine.test.js` | unit | PASS |
| 15 | Every real reference formats with exactly one italic segment (title XOR source), never both or neither | `src/content.test.js` | integration | PASS |
| 16 | The real content contains at least one periodical and one standalone reference (the classifier isn't vacuously true/false) | `src/content.test.js` | integration | PASS |

Evidence: `npm test` → `# tests 37 / # pass 37 / # fail 0`.

## Coverage

```
npm run test:coverage
file                     | line % | branch % | funcs % | uncovered lines
src/content.js           | 100.00 |   100.00 |  100.00 |
src/content.test.js      | 100.00 |   100.00 |  100.00 |
src/lib/magazine.js      | 100.00 |    96.15 |  100.00 |
src/lib/magazine.test.js | 100.00 |   100.00 |  100.00 |
src/lib/motion.js        | 100.00 |   100.00 |  100.00 |
src/lib/motion.test.js   | 100.00 |   100.00 |  100.00 |
all files                | 100.00 |    98.85 |  100.00 |
```

Well above the 80% bar. The <4% branch gap on `magazine.js` is the `lastSpace > 0` false-branch fallback in `truncateForTeaser` for text with no space in the truncation window — an intentionally minor, low-risk edge not worth a dedicated test.

## Known gaps (intentional)

The site's HTML/CSS/JS rendering and motion layer (`assets/js/render-cover.js`, `assets/js/render-article.js`, `assets/js/motion.js`, both `.html` pages, and the design system in `assets/css/style.css`) has **no automated tests**. This project is presentational: the only real logic worth TDD-ing was extracted into the pure functions in `src/lib/magazine.js` and `src/lib/motion.js`, both fully unit-tested. The DOM-rendering glue and visual layout were instead verified manually:

- Local static server (`scripts/dev-server.js`) started
- Both pages navigated via Playwright, checked for zero console errors
- Full accessibility-tree snapshot confirmed all 7 TOC entries, all 7 article sections with pull quotes, the Philippine-case sidebar, and all 16 alphabetized references rendered correctly with working links
- Re-checked at 390×844 (mobile) viewport: no horizontal scroll on either page, with motion enabled
- `prefers-reduced-motion: reduce` emulated via Playwright: confirmed instant opacity, ~0 transition duration, and `scroll-behavior: auto`

Adding jsdom or a headless-DOM test harness for the render/motion scripts was considered and skipped as unnecessary complexity for a single-issue static site (YAGNI) — the manual browser pass above gives equivalent confidence for content this size. If more issues are added later and the render/motion logic grows, revisit this.

### Bug caught and fixed during manual verification

The first implementation of scroll-reveal used `IntersectionObserver`, which only fires on a viewport-crossing *event*. Testing a large scroll jump (simulating clicking a TOC anchor deep into the article, or a fast flick-scroll) showed elements that were skipped over during the jump — never crossing the viewport boundary during any rendered frame — could get stuck permanently invisible (`opacity: 0`), silently hiding content. Manual browser testing with a real scroll sequence (not just a diff review) is what surfaced this; it would not have been caught by any unit test, since the bug was in the interaction between rendering and browser scroll timing. Fixed by switching to a `requestAnimationFrame`-driven `getBoundingClientRect` check re-evaluated on every scroll/resize frame — every element's visibility is freshly recomputed each frame rather than relying on a one-shot crossing detection, so nothing can get permanently stuck. Verified: jumped to the bottom (upper sections correctly still pending), then scrolled back up (they revealed correctly).
