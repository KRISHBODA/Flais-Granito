require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const run = async () => {
  await connectDB();
  await Admin.deleteOne({ email: "testadmin@flais.com" });
  await Admin.create({ email: "testadmin@flais.com", password: "password123" });
  console.log("Admin created: testadmin@flais.com / password123");
  process.exit(0);
};

run().catch(console.error);
