const axios = require('axios');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:8000/api';
let server;

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB for tests.');

  // Clean up any previous test data
  await Admin.deleteMany({ email: { $regex: /@test\.com$/ } });

  // 1. Create test users
  const superAdmin = await Admin.create({
    email: 'super@test.com',
    password: 'password123',
    name: 'Super Test',
    role: 'superadmin',
    mustChangePassword: false,
    isActive: true
  });

  const limitedAdmin = await Admin.create({
    email: 'limited@test.com',
    password: 'password123',
    name: 'Limited Test',
    role: 'admin',
    permissions: ['home'],
    mustChangePassword: false,
    isActive: true
  });

  const mustChangeAdmin = await Admin.create({
    email: 'change@test.com',
    password: 'password123',
    name: 'Must Change Test',
    role: 'admin',
    permissions: ['home'],
    mustChangePassword: true,
    isActive: true
  });

  const disabledAdmin = await Admin.create({
    email: 'disabled@test.com',
    password: 'password123',
    name: 'Disabled Test',
    role: 'admin',
    permissions: ['home'],
    mustChangePassword: false,
    isActive: false
  });

  console.log('Test users created.');

  // 2. Login to get tokens
  const getToken = async (email) => {
    const res = await axios.post(`${BASE_URL}/admin/login`, { email, password: 'password123' });
    return res.data.token;
  };

  const superToken = await getToken('super@test.com');
  const limitedToken = await getToken('limited@test.com');
  const changeToken = await getToken('change@test.com');
  
  let disabledToken = null;
  try {
     // disabled user might still login if we didn't block it at login endpoint, let's test if we did.
     // Wait, we didn't block login if disabled in `adminController.js`, we blocked it in `authMiddleware`.
     // Let's get the token anyway.
     const res = await axios.post(`${BASE_URL}/admin/login`, { email: 'disabled@test.com', password: 'password123' });
     disabledToken = res.data.token;
  } catch (e) {
     console.log('Disabled user login blocked:', e.response?.data?.message);
  }

  const makeReq = async (method, url, token, data=null) => {
    try {
      const res = await axios({
        method,
        url: `${BASE_URL}${url}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data,
        validateStatus: () => true // Don't throw on error
      });
      return res.status;
    } catch(e) {
      return e.response ? e.response.status : 'ERR';
    }
  };

  console.log('\n--- Test 1: Public Endpoints ---');
  console.log('GET /products (No Token):', await makeReq('get', '/products', null));
  console.log('GET /home (No Token):', await makeReq('get', '/home', null));

  console.log('\n--- Test 2: Enforce mustChangePassword ---');
  console.log('GET /admin/profile (mustChangePassword user):', await makeReq('get', '/admin/profile', changeToken));
  console.log('POST /admin/change-password (mustChangePassword user):', await makeReq('post', '/admin/change-password', changeToken, { newPassword: 'NewPassword123' }));
  
  // After change, it should work
  console.log('GET /admin/profile (after password change):', await makeReq('get', '/admin/profile', changeToken));

  console.log('\n--- Test 3: Disabled User ---');
  console.log('GET /admin/profile (Disabled user):', disabledToken ? await makeReq('get', '/admin/profile', disabledToken) : 'Not Logged In');

  console.log('\n--- Test 4: RBAC & Permissions ---');
  console.log('GET /admin/profile (Limited admin):', await makeReq('get', '/admin/profile', limitedToken)); // /profile has no authorize, just protect
  console.log('POST /hero (Limited admin with "home" perm):', await makeReq('post', '/hero', limitedToken)); // 400 because no image, but NOT 403
  console.log('POST /products (Limited admin NO "collection" perm):', await makeReq('post', '/products', limitedToken)); // should be 403
  console.log('POST /products (Super Admin):', await makeReq('post', '/products', superToken)); // should be 400 (missing fields), not 403

  console.log('\n--- Test 5: Dynamic Permission Change ---');
  // Revoke 'home' permission
  await Admin.updateOne({ email: 'limited@test.com' }, { permissions: [] });
  console.log('POST /hero (Limited admin AFTER perm removed):', await makeReq('post', '/hero', limitedToken)); // should be 403 now!

  // Clean up
  await Admin.deleteMany({ email: { $regex: /@test\.com$/ } });
  mongoose.disconnect();
}

runTests().catch(console.error);
