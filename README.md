# Contemporary World: Z32 GEWORLD

A creative, editorial e-magazine for Contemporary World (Z32 GEWORLD, international
studies). It currently publishes one issue, *Geopolitics of Social Media Platforms*,
sourced from `GEWORLD content (1).md`. It's built as zero-build static HTML/CSS/JS,
so it runs unmodified on GitHub Pages and Vercel.

## Structure

```
index.html                       cover page: masthead, hero, table of contents
issues/tiktok-geopolitics.html   the long-form article
assets/css/style.css             design system (editorial dark-tech theme)
assets/svg/                      original generative graphics (no stock photos)
assets/js/                       render scripts that turn content data into HTML
src/content.js                   structured issue data (title, sections, references)
src/lib/magazine.js              pure helpers: slugify, TOC, references, teaser, validation
src/*.test.js, src/lib/*.test.js unit tests (node:test, zero dependencies)
scripts/dev-server.js            zero-dependency local static server
```

## Adding a future issue

Add a new `issue`-shaped object (see `src/content.js` for the shape) and a new
page under `issues/`. `validateIssue()` in `src/lib/magazine.js` tells you if
required fields are missing.

## Local preview

```bash
npm run serve
# open http://localhost:4173
```

You need a local server because the pages load `<script type="module">`, and
browsers block ES module imports over `file://`.

## Tests

```bash
npm test              # run once
npm run test:coverage # with coverage report
```

## Deploying

### GitHub Pages

1. Push this repository to GitHub.
2. In the repo settings, go to **Pages** → **Build and deployment** → **Source**,
   then select **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Save. The site publishes at `https://<username>.github.io/<repo>/`.

The repo root already contains `index.html`, so no build step is needed.

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other** (static site). Leave the build command empty
   and the output directory as `.` (root); Vercel serves the static files
   directly.
3. Deploy.

Both hosts serve the same files, and neither needs per-host configuration.
