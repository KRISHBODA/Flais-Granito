const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const express = require('express');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.TOTP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
const Admin = require('../models/Admin');
const { loginAdmin, setup2FA } = require('../controllers/adminController');
const { validate2FAChallenge } = require('../middleware/authMiddleware');

const listen = (app, port = 0) => new Promise((resolve, reject) => {
  const server = app.listen(port, '127.0.0.1');
  server.once('listening', () => resolve(server));
  server.once('error', reject);
});

async function run() {
  const admin = {
    _id: '507f1f77bcf86cd799439011', email: 'superadmin@example.test',
    password: await bcrypt.hash('test-password', 10), role: 'superadmin',
    isActive: true, twoFactorEnabled: false, async save() { return this; },
  };
  Admin.findOne = async () => admin;
  Admin.findById = () => {
    const result = Promise.resolve(admin);
    result.select = () => Promise.resolve(admin);
    return result;
  };

  let setupCalls = 0;
  const api = express();
  api.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
  api.use(express.json());
  api.post('/api/admin/login', loginAdmin);
  api.post('/api/admin/2fa/setup', validate2FAChallenge('SETUP'), (req, res, next) => {
    setupCalls++;
    if (setupCalls === 1) return res.status(500).json({ success: false, message: 'Setup unavailable' });
    next();
  }, setup2FA);

  const dist = path.resolve(__dirname, '../../Flais-Admin/dist');
  const frontend = express();
  const automation = `<script>
    const waitFor = async fn => {
      for (let i = 0; i < 200; i++) {
        const value = fn();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      throw new Error('Browser state timed out');
    };
    const setReactInput = (element, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    };
    window.addEventListener('load', async () => {
      let stage = 'email';
      try {
        const email = await waitFor(() => document.querySelector('input[type=email]'));
        stage = 'submit';
        setReactInput(email, 'superadmin@example.test');
        setReactInput(document.querySelector('input[type=password]'), 'test-password');
        email.closest('form').querySelector('button[type=submit]').click();
        stage = 'failure';
        await waitFor(() => document.querySelector('[role=alert] button'));
        const failureHasNoOtp = !document.querySelector('input[placeholder="000000"]');
        document.querySelector('[role=alert] button').click();
        stage = 'qr';
        const image = await waitFor(() => document.querySelector('img[alt="Authenticator setup QR code"]'));
        await waitFor(() => image.complete && image.naturalWidth > 0);
        const result = {
          failureHasNoOtp,
          qrRendered: image.naturalWidth > 0 && image.naturalHeight > 0,
          otpAfterQr: Boolean(document.querySelector('input[placeholder="000000"]')),
          heading: document.body.textContent.includes('Two-Factor Authentication Setup'),
        };
        document.body.setAttribute('data-test-result', JSON.stringify(result));
      } catch (error) {
        document.body.setAttribute('data-test-result', JSON.stringify({ error: error.message, stage }));
      }
    });
  </script>`;
  frontend.get('/admin/login', (req, res) => {
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    res.type('html').send(html.replace('</body>', `${automation}</body>`));
  });
  frontend.use('/admin', express.static(dist));

  const apiServer = await listen(api, 8000);
  const uiServer = await listen(frontend);
  try {
    const apiPort = apiServer.address().port;
    const uiPort = uiServer.address().port;
    // The built client uses VITE_BACKEND_URL=http://localhost:8000.
    assert.equal(apiPort, 8000, 'Build expects API on port 8000');
    const html = await new Promise((resolve, reject) => {
      execFile('/usr/bin/google-chrome', [
        '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
        '--no-first-run', '--virtual-time-budget=15000', '--dump-dom', `http://127.0.0.1:${uiPort}/admin/login`,
      ], { maxBuffer: 15 * 1024 * 1024 }, (error, stdout) => error ? reject(error) : resolve(stdout));
    });
    const match = html.match(/data-test-result="([^"]+)"/);
    assert.ok(match, 'Browser automation did not finish');
    const result = JSON.parse(match[1].replaceAll('&quot;', '"'));
    assert.deepEqual(result, { failureHasNoOtp: true, qrRendered: true, otpAfterQr: true, heading: true }, `setupCalls=${setupCalls}`);
    assert.equal(setupCalls, 2);
    assert.equal(admin.twoFactorEnabled, false);
    assert.ok(admin.pendingTwoFactorSecretEncrypted);
    console.log('PASS: browser shows error without OTP, retries setup, and renders scannable QR before OTP');
  } finally {
    apiServer.close();
    uiServer.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
