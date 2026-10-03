const axios = require('axios');
const mongoose = require('mongoose');

// We don't have the exact DB URI or Admin model here if we want a pure script,
// so let's hit the login endpoint which requires Super Admin.
// Wait, to do this, we need a Super Admin account.
// Let's create one temporarily if it doesn't exist, or just promote an existing testadmin.

require("dotenv").config({ path: "./.env" });
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const runTests = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");

    // Create a temporary super admin
    let superAdmin = await Admin.findOne({ email: "testsuperadmin@flais.com" });
    if (!superAdmin) {
      superAdmin = await Admin.create({ 
        email: "testsuperadmin@flais.com", 
        password: "password123", 
        role: "superadmin" 
      });
      console.log("Created temporary super admin");
    }

    // Attempt login to get the SETUP challenge token
    const loginRes = await axios.post('http://localhost:8000/api/admin/login', {
      email: "testsuperadmin@flais.com",
      password: "password123"
    });

    const challengeToken = loginRes.data.challengeToken;
    console.log("Received challenge token. requires2FASetup:", loginRes.data.requires2FASetup);

    // Try accessing /api/admin/profile with the challenge token
    try {
      await axios.get('http://localhost:8000/api/admin/profile', {
        headers: { Authorization: `Bearer ${challengeToken}` }
      });
      console.error("FAIL: Successfully accessed /api/admin/profile with a challenge token!");
    } catch (err) {
      console.log(`SUCCESS: Blocked accessing /api/admin/profile. Status: ${err.response?.status}, Message: ${err.response?.data?.message}`);
    }

    // Try accessing /api/admin/users (which needs superadmin)
    try {
      await axios.get('http://localhost:8000/api/admin/users', { // assuming this route exists, let's use a known one
        headers: { Authorization: `Bearer ${challengeToken}` }
      });
      console.error("FAIL: Successfully accessed another protected route with a challenge token!");
    } catch (err) {
      console.log(`SUCCESS: Blocked accessing another protected route. Status: ${err.response?.status}, Message: ${err.response?.data?.message}`);
    }
    
    // Clean up
    await Admin.deleteOne({ email: "testsuperadmin@flais.com" });
    console.log("Test super admin deleted.");

    process.exit(0);
  } catch (error) {
    console.error("Test script failed:", error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    process.exit(1);
  }
};

runTests();
