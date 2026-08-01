import { computeReadingProgress, staggerDelay } from '../../src/lib/motion.js';

const revealTargets = Array.from(
  document.querySelectorAll('.toc__item, .section, .pull-quote, .sidebar')
);

revealTargets.forEach((el, index) => {
  el.setAttribute('data-reveal', '');
  el.style.transitionDelay = `${staggerDelay(index, { baseMs: 40, maxMs: 400 })}ms`;
});

let pendingReveal = revealTargets.slice();

function revealInView() {
  pendingReveal = pendingReveal.filter((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) el.classList.add('is-visible');
    return !inView;
  });
}

const sectionsRoot = document.getElementById('sections');
const progressBar = sectionsRoot ? document.createElement('div') : null;
if (progressBar) {
  progressBar.className = 'progress-bar';
  document.body.prepend(progressBar);
}

let ticking = false;

function onFrame() {
  revealInView();
  if (progressBar) {
    const progress = computeReadingProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    progressBar.style.width = `${progress}%`;
  }
  ticking = false;
}

function requestFrame() {
  if (!ticking) {
    requestAnimationFrame(onFrame);
    ticking = true;
  }
}

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame);

if (revealTargets.length > 0 || progressBar) requestFrame();
