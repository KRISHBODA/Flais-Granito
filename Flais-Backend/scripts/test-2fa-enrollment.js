const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.TOTP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

const Admin = require('../models/Admin');
const { decryptData } = require('../utils/crypto');
const { loginAdmin, setup2FA, verifySetup2FA } = require('../controllers/adminController');
const { validate2FAChallenge } = require('../middleware/authMiddleware');
const { generateSync } = require('otplib');

const run = async () => {
  const admin = {
    _id: '507f1f77bcf86cd799439011',
    email: 'superadmin@example.test',
    password: await bcrypt.hash('test-password', 10),
    role: 'superadmin',
    isActive: true,
    twoFactorEnabled: false,
    async save() { return this; },
  };
  Admin.findOne = async () => admin;
  Admin.findById = () => {
    const result = Promise.resolve(admin);
    result.select = () => Promise.resolve(admin);
    return result;
  };

  const app = express();
  app.use(express.json());
  app.post('/api/admin/login', loginAdmin);
  app.post('/api/admin/2fa/setup', validate2FAChallenge('SETUP'), setup2FA);
  app.post('/api/admin/2fa/verify-setup', validate2FAChallenge('SETUP'), verifySetup2FA);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = await fetch(`${base}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'test-password' }),
    });
    const loginData = await login.json();
    assert.equal(login.status, 200);
    assert.equal(loginData.requires2FASetup, true);
    assert.equal(typeof loginData.challengeToken, 'string');

    const setup = await fetch(`${base}/api/admin/2fa/setup`, {
      method: 'POST', headers: { Authorization: `Bearer ${loginData.challengeToken}` },
    });
    const setupData = await setup.json();
    assert.equal(setup.status, 200);
    assert.equal(setupData.success, true);
    assert.match(setupData.qrCodeDataUrl, /^data:image\/png;base64,/);
    assert.equal(Buffer.from(setupData.qrCodeDataUrl.split(',')[1], 'base64').subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(decryptData(admin.pendingTwoFactorSecretEncrypted), setupData.manualSecret);
    assert.notEqual(admin.pendingTwoFactorSecretEncrypted, setupData.manualSecret);
    assert.equal(admin.twoFactorEnabled, false);
    assert.equal(admin.twoFactorSecretEncrypted, undefined);

    const originalKey = process.env.TOTP_ENCRYPTION_KEY;
    process.env.TOTP_ENCRYPTION_KEY = '';
    const failedSetup = await fetch(`${base}/api/admin/2fa/setup`, {
      method: 'POST', headers: { Authorization: `Bearer ${loginData.challengeToken}` },
    });
    process.env.TOTP_ENCRYPTION_KEY = originalKey;
    assert.equal(failedSetup.status, 500);
    assert.equal((await failedSetup.json()).qrCodeDataUrl, undefined);
    assert.equal(admin.twoFactorEnabled, false);

    const verification = await fetch(`${base}/api/admin/2fa/verify-setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginData.challengeToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: generateSync({ secret: setupData.manualSecret }) }),
    });
    assert.equal(verification.status, 200);
    assert.equal(admin.twoFactorEnabled, true);
    assert.equal(admin.pendingTwoFactorSecretEncrypted, undefined);
    assert.ok(admin.twoFactorSecretEncrypted);
    console.log('PASS: login challenge, setup HTTP 200, PNG QR, encrypted pending secret, inactive 2FA, setup HTTP 500, OTP activation');
  } finally {
    server.close();
  }
};

run().catch(error => { console.error(error); process.exitCode = 1; });
