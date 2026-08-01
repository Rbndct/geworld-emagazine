import { issue } from '../../src/content.js';
import { buildTOC, truncateForTeaser } from '../../src/lib/magazine.js';

document.getElementById('hero-title').textContent = issue.title;
document.getElementById('hero-dek').textContent = truncateForTeaser(issue.dek, 220);

const tocList = document.getElementById('toc-list');
const toc = buildTOC(issue.sections);

toc.forEach((entry, index) => {
  const li = document.createElement('li');
  li.className = 'toc__item';

  const a = document.createElement('a');
  a.className = 'toc__link';
  a.href = `issues/${issue.slug}.html#${entry.id}`;

  const num = document.createElement('span');
  num.className = 'toc__index';
  num.textContent = String(index + 1).padStart(2, '0');

  const label = document.createElement('span');
  label.className = 'toc__label';
  label.textContent = entry.title;

  a.append(num, label);
  li.append(a);
  tocList.append(li);
});
