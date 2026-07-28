import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

import {
  isLocalMediaUrl,
  getRelativeMediaPath,
  resolveMediaUrl,
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
} from './imageOptimizer.js';

// A deployed (non localhost) window keeps URL resolution on the same origin,
// which is the only branch that does not depend on Vite's import.meta.env.
beforeEach(() => {
  globalThis.window = { location: { hostname: 'flais.test', origin: 'https://flais.test' } };
});

afterEach(() => {
  delete globalThis.window;
});

test('isLocalMediaUrl treats relative paths and known media hosts as local', () => {
  assert.ok(isLocalMediaUrl('images/a.png'));
  assert.ok(isLocalMediaUrl('/media/images/a.png'));
  assert.ok(isLocalMediaUrl('http://localhost:8000/media/images/a.png'));
  assert.ok(isLocalMediaUrl('http://127.0.0.1:8000/images/a.png'));
  assert.ok(isLocalMediaUrl('https://flais.test/uploads/a.png'));

  assert.ok(!isLocalMediaUrl(''));
  assert.ok(!isLocalMediaUrl('https://cdn.example.com/a.png'));
});

test('getRelativeMediaPath strips the media and uploads prefixes', () => {
  assert.strictEqual(getRelativeMediaPath(''), '');
  assert.strictEqual(getRelativeMediaPath('https://flais.test/media/images/a.png'), 'images/a.png');
  assert.strictEqual(getRelativeMediaPath('https://flais.test/uploads/images/a.png'), 'images/a.png');
  assert.strictEqual(getRelativeMediaPath('https://flais.test/other/a.png'), 'other/a.png');
  assert.strictEqual(getRelativeMediaPath('/media/images/a.png'), 'images/a.png');
  assert.strictEqual(getRelativeMediaPath('///images/a.png'), 'images/a.png');
  assert.strictEqual(getRelativeMediaPath('images/a.png'), 'images/a.png');
});

test('resolveMediaUrl rebuilds local media urls against the current origin', () => {
  assert.strictEqual(resolveMediaUrl(''), '');
  assert.strictEqual(resolveMediaUrl('images/a.png'), 'https://flais.test/media/images/a.png');
  assert.strictEqual(resolveMediaUrl('/media/images/a.png'), 'https://flais.test/media/images/a.png');
  assert.strictEqual(
    resolveMediaUrl('http://localhost:8000/media/images/a.png'),
    'https://flais.test/media/images/a.png'
  );
});

test('resolveMediaUrl leaves remote urls untouched', () => {
  assert.strictEqual(resolveMediaUrl('https://cdn.example.com/a.png'), 'https://cdn.example.com/a.png');
});

test('getOptimizedImageUrl and getOptimizedVideoUrl delegate to resolveMediaUrl', () => {
  assert.strictEqual(getOptimizedImageUrl(''), '');
  assert.strictEqual(getOptimizedVideoUrl(''), '');
  assert.strictEqual(getOptimizedImageUrl('images/a.png'), 'https://flais.test/media/images/a.png');
  assert.strictEqual(getOptimizedVideoUrl('videos/a.mp4'), 'https://flais.test/media/videos/a.mp4');
  assert.strictEqual(getOptimizedVideoUrl('https://cdn.example.com/a.mp4'), 'https://cdn.example.com/a.mp4');
});
