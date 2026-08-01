import { issue } from '../../src/content.js';
import { buildTOC, formatReference } from '../../src/lib/magazine.js';

document.getElementById('article-kicker').textContent = issue.tab;
document.getElementById('article-title').textContent = issue.title;
document.getElementById('article-dek').textContent = issue.dek;

const sourceLink = document.getElementById('article-source-link');
sourceLink.href = issue.mainArticleUrl;

const toc = buildTOC(issue.sections);
const sectionsRoot = document.getElementById('sections');

issue.sections.forEach((section, index) => {
  if (index > 0) {
    const divider = document.createElement('img');
    divider.className = 'divider';
    divider.src = '../assets/svg/divider.svg';
    divider.alt = '';
    sectionsRoot.append(divider);
  }

  const el = document.createElement('section');
  el.className = 'section';
  el.id = toc[index].id;

  const kicker = document.createElement('p');
  kicker.className = 'section__kicker';
  kicker.textContent = section.kicker ?? '';

  const title = document.createElement('h2');
  title.className = 'section__title';
  title.textContent = section.title;

  el.append(kicker, title);

  section.body.forEach((paragraph, pIndex) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    el.append(p);

    if (pIndex === 0 && section.pullQuote) {
      const quote = document.createElement('blockquote');
      quote.className = 'pull-quote';
      quote.textContent = section.pullQuote;
      el.append(quote);
    }
  });

  if (section.sidebar) {
    const aside = document.createElement('aside');
    aside.className = 'sidebar';

    const sidebarTitle = document.createElement('p');
    sidebarTitle.className = 'sidebar__title';
    sidebarTitle.textContent = section.sidebar.title;

    const list = document.createElement('ul');
    list.className = 'sidebar__list';

    section.sidebar.items.forEach((item) => {
      const li = document.createElement('li');
      const when = document.createElement('span');
      when.className = 'sidebar__when';
      when.textContent = item.when;
      const what = document.createElement('span');
      what.textContent = item.what;
      li.append(when, what);
      list.append(li);
    });

    aside.append(sidebarTitle, list);
    el.append(aside);
  }

  sectionsRoot.append(el);
});

function referenceNode(text, italic) {
  if (!italic) return document.createTextNode(text);
  const em = document.createElement('em');
  em.textContent = text;
  return em;
}

const referencesList = document.getElementById('references-list');
issue.references
  .slice()
  .sort((a, b) => a.authors.localeCompare(b.authors))
  .forEach((ref) => {
    const formatted = formatReference(ref);
    const li = document.createElement('li');
    li.className = 'references__item';

    const container = formatted.url ? document.createElement('a') : document.createElement('span');
    if (formatted.url) {
      container.href = formatted.url;
      container.target = '_blank';
      container.rel = 'noopener noreferrer';
    }

    container.append(
      document.createTextNode(`${formatted.authorYear} `),
      referenceNode(formatted.title, formatted.titleItalic),
      document.createTextNode(' '),
      referenceNode(formatted.source, formatted.sourceItalic)
    );

    li.append(container);
    referencesList.append(li);
  });
