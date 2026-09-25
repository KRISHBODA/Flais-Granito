const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    const result = await Admin.updateMany({}, { $set: { role: "superadmin", isActive: true, mustChangePassword: false, permissions: [] } });
    console.log("Migrated admins to superadmin:", result);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
