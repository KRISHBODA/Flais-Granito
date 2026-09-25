require("dotenv").config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const run = async () => {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/createSuperAdmin.js <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters long.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin with email ${email} already exists. Upgrading to superadmin...`);
    existing.role = "superadmin";
    await existing.save();
    console.log("Successfully upgraded to superadmin.");
    process.exit(0);
  }

  const newAdmin = await Admin.create({ 
    email, 
    password, 
    role: "superadmin", 
    isActive: true, 
    mustChangePassword: false,
    permissions: []
  });
  
  console.log(`Super Admin created successfully: ${newAdmin.email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
