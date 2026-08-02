# Contemporary World: Z32 GEWORLD

A creative, editorial e-magazine for Contemporary World (Z32 GEWORLD, international
studies). It currently publishes one issue, *Geopolitics of Social Media Platforms*,
sourced from `GEWORLD content (1).md`. It's built as zero-build static HTML/CSS/JS,
so it runs unmodified on GitHub Pages and Vercel.

## Structure

```
index.html      cover page: masthead, hero, table of contents
issues/         article pages
assets/         CSS, SVG, and render scripts
src/content.js  structured issue data (title, sections, references)
```

## Local preview

```bash
npm run serve
# open http://localhost:4173
```

You need a local server because the pages load `<script type="module">`, and
browsers block ES module imports over `file://`.
