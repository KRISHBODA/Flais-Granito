import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  stripHtmlTags,
  escapeHtml,
  sanitizeObject,
  generateCsrfToken,
  getCsrfToken,
  isValidCsrfToken,
  checkRateLimit,
  secureStore,
  secureRetrieve,
  secureClear,
  validateFileUpload,
  detectXssPatterns,
  hashString,
  generateRandomString,
  logSecurityEvent,
} from './security.js';

// Minimal browser stubs: the module only relies on textContent -> innerHTML
// escaping, a csrf-token meta tag and the web storage APIs.
const createStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
  };
};

let metaContent = null;

beforeEach(() => {
  metaContent = null;
  globalThis.sessionStorage = createStorage();
  globalThis.localStorage = createStorage();
  globalThis.document = {
    createElement: () => ({
      _text: '',
      get innerHTML() {
        return this.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      },
      set textContent(value) {
        this._text = value;
      },
      get textContent() {
        return this._text ?? '';
      },
    }),
    querySelector: (selector) =>
      selector === 'meta[name="csrf-token"]' && metaContent !== null
        ? { getAttribute: () => metaContent }
        : null,
  };
});

afterEach(() => {
  delete globalThis.sessionStorage;
  delete globalThis.localStorage;
  delete globalThis.document;
});

test('sanitizeInput escapes markup and rejects non strings', () => {
  assert.strictEqual(sanitizeInput('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(sanitizeInput('plain & simple'), 'plain &amp; simple');
  assert.strictEqual(sanitizeInput(42), '');
  assert.strictEqual(sanitizeInput(null), '');
});

test('isValidEmail accepts well formed addresses under the length limit', () => {
  assert.ok(isValidEmail('user@test.com'));
  assert.ok(!isValidEmail('user@test'));
  assert.ok(!isValidEmail('user test@test.com'));
  assert.ok(!isValidEmail('@test.com'));
  assert.ok(!isValidEmail(`${'a'.repeat(250)}@test.com`));
});

test('isValidPhone accepts international style numbers of at least 7 characters', () => {
  assert.ok(isValidPhone('+91 (982) 123-4567'));
  assert.ok(!isValidPhone('12345'));
  assert.ok(!isValidPhone('call-me-now'));
});

test('isValidUrl allows http, https and relative urls only', () => {
  assert.ok(isValidUrl('https://flais.test/page'));
  assert.ok(isValidUrl('http://flais.test'));
  assert.ok(isValidUrl('/products'));
  assert.ok(isValidUrl('./products'));
  assert.ok(!isValidUrl('javascript:alert(1)'));
  assert.ok(!isValidUrl('JavaScript:alert(1)'));
  assert.ok(!isValidUrl('data:text/html;base64,PHN2Zz4='));
  assert.ok(!isValidUrl('ftp://flais.test'));
  assert.ok(!isValidUrl('not a url'));
  assert.ok(!isValidUrl(undefined));
});

test('stripHtmlTags removes tags and rejects non strings', () => {
  assert.strictEqual(stripHtmlTags('<p>Hello <b>world</b></p>'), 'Hello world');
  assert.strictEqual(stripHtmlTags(null), '');
});

test('escapeHtml escapes every special character', () => {
  assert.strictEqual(escapeHtml(`<a href="/x">O'Neil & co</a>`), '&lt;a href=&quot;&#x2F;x&quot;&gt;O&#39;Neil &amp; co&lt;&#x2F;a&gt;');
  assert.strictEqual(escapeHtml(123), '');
});

test('sanitizeObject drops prototype polluting keys', () => {
  const cleaned = sanitizeObject(JSON.parse('{"name":"ok","__proto__":{"admin":true},"constructor":1,"prototype":2}'));

  assert.deepStrictEqual(cleaned, { name: 'ok' });
  assert.deepStrictEqual(sanitizeObject(null), {});
  assert.deepStrictEqual(sanitizeObject('string'), {});
});

test('generateCsrfToken produces unique 64 character hex tokens', () => {
  const token = generateCsrfToken();

  assert.ok(isValidCsrfToken(token));
  assert.notStrictEqual(token, generateCsrfToken());
});

test('isValidCsrfToken rejects malformed tokens', () => {
  assert.ok(!isValidCsrfToken('abc'));
  assert.ok(!isValidCsrfToken('Z'.repeat(64)));
  assert.ok(!isValidCsrfToken(undefined));
});

test('getCsrfToken prefers the meta tag and falls back to session storage', () => {
  assert.strictEqual(getCsrfToken(), null);

  sessionStorage.setItem('csrf-token', 'from-session');
  assert.strictEqual(getCsrfToken(), 'from-session');

  metaContent = 'from-meta';
  assert.strictEqual(getCsrfToken(), 'from-meta');
});

test('checkRateLimit allows up to the limit then blocks within the window', () => {
  assert.deepStrictEqual([checkRateLimit('login', 2), checkRateLimit('login', 2), checkRateLimit('login', 2)], [
    true,
    true,
    false,
  ]);
  assert.ok(checkRateLimit('other-action', 2));
});

test('checkRateLimit forgets attempts older than the window', () => {
  sessionStorage.setItem('ratelimit_stale', JSON.stringify([Date.now() - 120000]));

  assert.ok(checkRateLimit('stale', 1, 60000));
  assert.ok(!checkRateLimit('stale', 1, 60000));
});

test('secureStore, secureRetrieve and secureClear use the requested storage', () => {
  secureStore('token', 'abc');
  secureStore('token', 'xyz', 'local');

  assert.strictEqual(secureRetrieve('token'), 'abc');
  assert.strictEqual(secureRetrieve('token', 'local'), 'xyz');

  secureClear('token');
  assert.strictEqual(secureRetrieve('token'), null);
  assert.strictEqual(secureRetrieve('token', 'local'), 'xyz');

  secureStore('a', '1');
  secureClear();
  assert.strictEqual(secureRetrieve('a'), null);

  secureClear(undefined, 'local');
  assert.strictEqual(secureRetrieve('token', 'local'), null);
});

test('validateFileUpload enforces presence, size, type and extension', () => {
  const file = { name: 'photo.png', size: 1024, type: 'image/png' };

  assert.deepStrictEqual(validateFileUpload(file), { isValid: true, error: null });
  assert.deepStrictEqual(validateFileUpload(null), { isValid: false, error: 'No file provided' });

  const tooBig = validateFileUpload({ ...file, size: 6 * 1024 * 1024 });
  assert.ok(!tooBig.isValid);
  assert.match(tooBig.error, /exceeds 5MB limit/);

  const badType = validateFileUpload({ ...file, type: 'text/html' });
  assert.ok(!badType.isValid);
  assert.match(badType.error, /File type not allowed/);

  const badExtension = validateFileUpload({ ...file, name: 'photo.exe' });
  assert.ok(!badExtension.isValid);
  assert.match(badExtension.error, /File extension not allowed/);
});

test('validateFileUpload honours custom options', () => {
  const options = { maxSize: 100, allowedTypes: ['image/webp'], allowedExtensions: ['webp'] };

  assert.deepStrictEqual(validateFileUpload({ name: 'a.webp', size: 50, type: 'image/webp' }, options), {
    isValid: true,
    error: null,
  });
  assert.ok(!validateFileUpload({ name: 'a.png', size: 50, type: 'image/png' }, options).isValid);
});

test('detectXssPatterns flags common injection payloads', () => {
  const payloads = [
    '<script>alert(1)</script>',
    'javascript:alert(1)',
    '<div onclick="steal()">',
    '<iframe src="evil"></iframe>',
    '<object data="evil">',
    '<embed src="evil">',
    '<img src=x onerror=alert(1)>',
  ];

  for (const payload of payloads) {
    assert.ok(detectXssPatterns(payload), `expected ${payload} to be flagged`);
  }

  assert.ok(!detectXssPatterns('A perfectly ordinary sentence.'));
  assert.ok(!detectXssPatterns(null));
});

test('hashString returns a stable sha-256 hex digest', async () => {
  const hash = await hashString('flais');

  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.strictEqual(hash, await hashString('flais'));
  assert.notStrictEqual(hash, await hashString('flais!'));
});

test('generateRandomString honours the requested length and alphabet', () => {
  assert.strictEqual(generateRandomString().length, 32);

  const value = generateRandomString(16);
  assert.strictEqual(value.length, 16);
  assert.match(value, /^[A-Za-z0-9]{16}$/);
});

test('logSecurityEvent is a no-op in both environments', () => {
  const env = globalThis.process.env;
  const previous = env.NODE_ENV;

  try {
    env.NODE_ENV = 'production';
    assert.strictEqual(logSecurityEvent('login_failure', { user: 'a' }), undefined);
    env.NODE_ENV = 'development';
    assert.strictEqual(logSecurityEvent('login_failure'), undefined);
  } finally {
    env.NODE_ENV = previous;
  }
});
