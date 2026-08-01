export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function computeReadingProgress(scrollY, docHeight, viewportHeight) {
  const scrollable = docHeight - viewportHeight;
  if (scrollable <= 0) return 100;
  return clamp((scrollY / scrollable) * 100, 0, 100);
}

export function staggerDelay(index, { baseMs = 60, maxMs = 480 } = {}) {
  return clamp(index * baseMs, 0, maxMs);
}
