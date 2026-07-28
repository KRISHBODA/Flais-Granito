const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = "flais-admin";
const JWT_AUDIENCE = "flais-dashboard";

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!JWT_SECRET) {
    return sendError(res, 500, "Server misconfigured");
  }

  if (!email || !password) {
    return sendError(res, 400, "Email and password are required");
  }

  const normalizedEmail = String(email).trim();
  const admin = await Admin.findOne({
    email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
  });
  if (!admin) {
    return sendError(res, 401, "Invalid Email or Password");
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return sendError(res, 401, "Invalid Email or Password");
  }

  // Generate Token
  const token = jwt.sign(
    { id: admin._id },
    JWT_SECRET,
    { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );

  sendSuccess(res, 200, {
    message: "Login successful",
    token, // Send token to frontend
    email: admin.email,
  });
});

exports.getAdminProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return sendError(res, 401, "Not authorized");
  }
  res.status(200).json({ email: req.admin.email });
});

exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!req.admin) {
    return sendError(res, 401, "Not authorized");
  }

  const admin = await Admin.findById(req.admin._id);

  if (!admin) return res.status(404).json({ message: "Admin not found" });

  // Update email if provided
  if (email) admin.email = String(email).trim().toLowerCase();

  // Update password only if the user typed something in the password field
  if (password && password.trim() !== "") {
    admin.password = password;
    // Note: The pre-save hook in models/Admin.js will automatically hash this
  }

  await admin.save();
  sendSuccess(res, 200, { message: "Credentials updated successfully!" });
});
