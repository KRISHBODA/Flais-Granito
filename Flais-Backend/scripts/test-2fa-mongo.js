const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const mongoose = require('mongoose');

process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.TOTP_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
const Admin = require('../models/Admin');
const { setup2FA } = require('../controllers/adminController');
const { decryptData } = require('../utils/crypto');

async function run() {
  const dbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'flais-2fa-mongo-'));
  const port = 27019;
  const mongod = spawn('mongod', ['--dbpath', dbPath, '--port', String(port), '--bind_ip', '127.0.0.1', '--quiet'], { stdio: 'ignore' });
  try {
    let connected = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      if (mongod.exitCode !== null) throw new Error(`mongod exited with ${mongod.exitCode}`);
      try {
        await mongoose.connect(`mongodb://127.0.0.1:${port}/flais-2fa-test`, { serverSelectionTimeoutMS: 300 });
        connected = true;
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.equal(connected, true, 'Local MongoDB did not start');
    const admin = await Admin.create({
      email: 'superadmin@example.test', password: 'test-password', role: 'superadmin', isActive: true,
    });
    const response = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await setup2FA({ admin }, response);
    assert.equal(response.code, 200);
    assert.match(response.data.qrCodeDataUrl, /^data:image\/png;base64,/);
    const stored = await Admin.collection.findOne({ _id: admin._id });
    assert.ok(stored.pendingTwoFactorSecretEncrypted);
    assert.equal(decryptData(stored.pendingTwoFactorSecretEncrypted), response.data.manualSecret);
    assert.notEqual(stored.pendingTwoFactorSecretEncrypted, response.data.manualSecret);
    assert.equal(stored.twoFactorEnabled, false);
    assert.equal(stored.twoFactorSecretEncrypted, undefined);
    console.log('PASS: MongoDB persisted encrypted pending secret with 2FA disabled and no active secret');
  } finally {
    await mongoose.disconnect();
    if (mongod.exitCode === null) {
      mongod.kill('SIGTERM');
      await new Promise(resolve => mongod.once('exit', resolve));
    }
    fs.rmSync(dbPath, { recursive: true, force: true });
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
