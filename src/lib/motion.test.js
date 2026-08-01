import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, computeReadingProgress, staggerDelay } from './motion.js';

describe('clamp', () => {
  it('returns the value when within range', () => {
    assert.equal(clamp(5, 0, 10), 5);
  });

  it('clamps to the minimum', () => {
    assert.equal(clamp(-5, 0, 10), 0);
  });

  it('clamps to the maximum', () => {
    assert.equal(clamp(50, 0, 10), 10);
  });
});

describe('computeReadingProgress', () => {
  it('returns 0 at the top of the page', () => {
    assert.equal(computeReadingProgress(0, 2000, 800), 0);
  });

  it('returns 100 at the bottom of the page', () => {
    assert.equal(computeReadingProgress(1200, 2000, 800), 100);
  });

  it('returns a proportional value in between', () => {
    assert.equal(computeReadingProgress(600, 2000, 800), 50);
  });

  it('returns 100 when the page is shorter than the viewport', () => {
    assert.equal(computeReadingProgress(0, 500, 800), 100);
  });

  it('clamps values beyond the scrollable range', () => {
    assert.equal(computeReadingProgress(5000, 2000, 800), 100);
  });
});

describe('staggerDelay', () => {
  it('returns 0 for the first index', () => {
    assert.equal(staggerDelay(0, { baseMs: 60, maxMs: 480 }), 0);
  });

  it('multiplies index by baseMs', () => {
    assert.equal(staggerDelay(3, { baseMs: 60, maxMs: 480 }), 180);
  });

  it('caps the delay at maxMs', () => {
    assert.equal(staggerDelay(50, { baseMs: 60, maxMs: 480 }), 480);
  });

  it('uses sensible defaults when options are omitted', () => {
    assert.equal(staggerDelay(1), 60);
  });
});
