import { computeReadingProgress, staggerDelay } from '../../src/lib/motion.js';

const revealTargets = document.querySelectorAll('.toc__item, .section, .pull-quote, .sidebar');

revealTargets.forEach((el, index) => {
  el.setAttribute('data-reveal', '');
  el.style.transitionDelay = `${staggerDelay(index, { baseMs: 40, maxMs: 400 })}ms`;
});

if (revealTargets.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

const sectionsRoot = document.getElementById('sections');
if (sectionsRoot) {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);

  let ticking = false;
  const updateProgress = () => {
    const progress = computeReadingProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    bar.style.width = `${progress}%`;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateProgress();
}
