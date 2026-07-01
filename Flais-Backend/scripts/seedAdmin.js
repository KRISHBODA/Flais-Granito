require("dotenv").config();
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const DEFAULT_EMAIL = "admin@flais.com";
const DEFAULT_PASSWORD = "password123";

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_SEED_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD || DEFAULT_PASSWORD;

  const existing = await Admin.findOne({ email });
  if (existing) {
    process.exit(0);
  }

  await Admin.create({ email, password });

  process.exit(0);
};

run().catch((error) => {
  process.exit(1);
});
