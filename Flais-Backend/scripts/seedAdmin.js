require("dotenv").config();
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const DEFAULT_EMAIL = "admin@flais.com";
const MIN_PASSWORD_LENGTH = 12;

const run = async () => {
  const email = process.env.ADMIN_SEED_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `ADMIN_SEED_PASSWORD is required and must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
    process.exit(1);
  }

  await connectDB();

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
