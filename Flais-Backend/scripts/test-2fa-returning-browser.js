const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const WebSocket = require('/usr/share/nodejs/ws');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateSecret, generateSync } = require('otplib');

process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.TOTP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
const Admin = require('../models/Admin');
const { encryptData } = require('../utils/crypto');
const { loginAdmin, verify2FA, getAdminProfile } = require('../controllers/adminController');
const { validate2FAChallenge, protect } = require('../middleware/authMiddleware');

const listen = (app, port = 0) => new Promise((resolve, reject) => {
  const server = app.listen(port, '127.0.0.1');
  server.once('listening', () => resolve(server));
  server.once('error', reject);
});

async function inspectBrowser(url) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'flais-chrome-'));
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--disable-background-networking', '--blink-settings=imagesEnabled=false',
    '--remote-debugging-port=9223', '--remote-allow-origins=*', `--user-data-dir=${profile}`, url,
  ], { stdio: 'ignore' });
  let socket;
  try {
    let target;
    for (let i = 0; i < 100; i++) {
      try {
        const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
        target = pages.find(page => page.type === 'page');
        if (target) break;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(target, 'Chrome debugger did not start');
    socket = new WebSocket(target.webSocketDebuggerUrl, { origin: 'http://127.0.0.1:9223' });
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    let nextId = 1;
    let evalCount = 0;
    const pending = new Map();
    socket.on('message', payload => {
      const message = JSON.parse(payload.toString());
      if (pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    });
    const evaluate = expression => new Promise((resolve, reject) => {
      evalCount++;
      const id = nextId++;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      setTimeout(() => { if (pending.delete(id)) reject(new Error(`Chrome evaluation timed out on poll ${evalCount}`)); }, 2000);
    });
    for (let i = 0; i < 80; i++) {
      try {
        const response = await evaluate("document.body?.getAttribute('data-test-result') || null");
        const result = response.result?.result?.value;
        if (result) return JSON.parse(result);
      } catch {
        let progress;
        for (let attempt = 0; attempt < 30; attempt++) {
          progress = await (await fetch(new URL('/test/progress', url))).json();
          if (progress.final) return progress.final;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
        throw new Error(`Browser inspector stopped after ${progress.stage || 'startup'}; page=${pages.find(page => page.type === 'page')?.url || 'none'}; socket=${socket.readyState}`);
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw new Error('Browser automation did not finish');
  } finally {
    socket?.close();
    if (chrome.exitCode === null) {
      chrome.kill('SIGTERM');
      await new Promise(resolve => chrome.once('exit', resolve));
    }
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
  }
}

async function run() {
  const secret = generateSecret();
  const superAdmin = {
    _id: '507f1f77bcf86cd799439011', email: 'superadmin@example.test',
    password: await bcrypt.hash('test-password', 10), role: 'superadmin',
    isActive: true, twoFactorEnabled: true, twoFactorSecretEncrypted: encryptData(secret),
    pendingTwoFactorSecretEncrypted: undefined, twoFactorVerifiedAt: new Date(),
  };
  const normalAdmin = {
    _id: '507f1f77bcf86cd799439012', email: 'admin@example.test',
    password: await bcrypt.hash('normal-password', 10), role: 'admin',
    isActive: true, twoFactorEnabled: false, permissions: [],
  };
  Admin.findOne = async ({ email }) => [superAdmin, normalAdmin].find(admin => email.test(admin.email)) || null;
  Admin.findById = id => {
    const result = Promise.resolve([superAdmin, normalAdmin].find(admin => String(admin._id) === String(id)) || null);
    result.select = () => result;
    return result;
  };

  const statuses = [];
  let verifyCalls = 0;
  const verifyStatuses = [];
  const api = express();
  api.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
  api.use(express.json());
  api.post('/api/admin/login', (req, res, next) => {
    res.on('finish', () => statuses.push(res.statusCode));
    if (req.body.password === 'rate-limit-test') return res.status(429).json({ success: false, message: 'Too many login attempts' });
    if (req.body.password === 'server-error-test') return res.status(500).json({ success: false, message: 'Server Error' });
    if (req.body.password === 'network-error-test') return req.socket.destroy();
    next();
  }, loginAdmin);
  api.post('/api/admin/2fa/verify', validate2FAChallenge('VERIFY'), (req, res, next) => {
    verifyCalls++;
    res.on('finish', () => verifyStatuses.push(res.statusCode));
    next();
  }, verify2FA);
  api.get('/api/admin/profile', protect, getAdminProfile);

  const dist = path.resolve(__dirname, '../../Flais-Admin/dist');
  const frontend = express();
  const progress = { stage: 'startup' };
  const automation = `<script>
    const waitFor = async fn => {
      for (let i = 0; i < 60; i++) {
        const value = fn();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      throw new Error('Browser state timed out');
    };
    const setInput = (element, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    };
    let runtimeErrors = 0;
    const report = data => fetch('/test/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), keepalive: true,
    });
    window.addEventListener('error', () => runtimeErrors++);
    window.addEventListener('unhandledrejection', () => runtimeErrors++);
    window.addEventListener('load', async () => {
      let stage = 'login';
      try {
        const email = await waitFor(() => document.querySelector('input[type=email]'));
        setInput(email, 'superadmin@example.test');
        const submit = async password => {
          setInput(document.querySelector('input[type=password]'), password);
          document.querySelector('form button[type=submit]').click();
        };
        await submit('wrong-password');
        await waitFor(() => document.querySelector('[role=alert]')?.textContent.includes('Invalid email or password'));
        stage = 'rate-limit';
        await submit('rate-limit-test');
        await waitFor(() => document.querySelector('[role=alert]')?.textContent.includes('Too many login attempts'));
        stage = 'server-error';
        await submit('server-error-test');
        await waitFor(() => document.querySelector('[role=alert]')?.textContent.includes('Unable to complete login'));
        stage = 'network-error';
        await submit('network-error-test');
        await waitFor(() => document.querySelector('[role=alert]')?.textContent.includes('Cannot connect to the server'));
        stage = 'challenge';
        await submit('test-password');
        const otpInput = await waitFor(() => document.querySelector('input[placeholder="000000"]'));
        const challengeOnly = !localStorage.getItem('adminToken') && !document.querySelector('img[alt="Authenticator setup QR code"]');
        report({ stage: 'challenge' });
        stage = 'verify-input';
        const currentCode = await (await fetch('/test/current-code')).text();
        setInput(otpInput, currentCode);
        stage = 'verify-submit';
        document.querySelector('form button[type=submit]').click();
        stage = 'dashboard-wait';
        await waitFor(() => location.pathname === '/admin/home' && localStorage.getItem('adminToken'));
        const dashboardReached = location.pathname === '/admin/home';
        const result = {
          challengeOnly, dashboardReached, hasAuthenticatedToken: Boolean(localStorage.getItem('adminToken')), runtimeErrors,
        };
        report({ stage: 'dashboard', final: result });
        document.body.setAttribute('data-test-result', JSON.stringify(result));
      } catch (error) {
        const result = { error: error.message, stage, runtimeErrors };
        report({ stage, final: result });
        document.body.setAttribute('data-test-result', JSON.stringify(result));
      }
    });
  </script>`;
  frontend.get('/admin/login', (req, res) => {
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    res.type('html').send(html.replace('</body>', `${automation}</body>`));
  });
  frontend.get('/test/current-code', (req, res) => res.type('text').send(generateSync({ secret })));
  frontend.get('/test/progress', (req, res) => res.json(progress));
  frontend.post('/test/progress', express.json(), (req, res) => { Object.assign(progress, req.body); res.sendStatus(204); });
  // Keep the route and auth layout real while omitting unrelated dashboard data requests.
  frontend.get(/^\/admin\/assets\/AdminHome-[^/]+\.js$/, (req, res) => {
    res.type('application/javascript').send('export default function AdminHome(){return null;}');
  });
  frontend.use('/admin', express.static(dist));

  const apiServer = await listen(api, 8000);
  const uiServer = await listen(frontend);
  try {
    const base = `http://127.0.0.1:${apiServer.address().port}`;
    const normalLogin = await fetch(`${base}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalAdmin.email, password: 'normal-password' }),
    });
    const normalData = await normalLogin.json();
    assert.equal(normalLogin.status, 200);
    assert.equal(normalData.requires2FA, undefined);
    assert.equal(jwt.verify(normalData.token, process.env.JWT_SECRET, { issuer: 'flais-admin', audience: 'flais-dashboard' }).id, normalAdmin._id);

    const returnedLogin = await fetch(`${base}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: superAdmin.email, password: 'test-password' }),
    });
    const returnedData = await returnedLogin.json();
    assert.equal(returnedLogin.status, 200);
    assert.equal(returnedData.requires2FA, true);
    assert.equal(returnedData.token, undefined);
    const claims = jwt.verify(returnedData.challengeToken, process.env.JWT_SECRET, { issuer: 'flais-admin', audience: 'flais-2fa' });
    assert.equal(claims.twoFactorPhase, 'VERIFY');
    assert.ok(claims.exp - claims.iat <= 300);

    const result = await inspectBrowser(`http://127.0.0.1:${uiServer.address().port}/admin/login`);
    assert.deepEqual(result, { challengeOnly: true, dashboardReached: true, hasAuthenticatedToken: true, runtimeErrors: 0 });
    assert.deepEqual(statuses.slice(-4), [401, 429, 500, 200]);
    assert.equal(verifyCalls, 1);
    assert.equal(superAdmin.twoFactorEnabled, true);
    assert.ok(superAdmin.twoFactorSecretEncrypted);
    console.log('PASS: 401/429/500/network errors visible, VERIFY challenge, OTP, authenticated dashboard navigation, normal Admin login');
  } finally {
    apiServer.close();
    uiServer.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
