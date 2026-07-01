const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = "flais-admin";
const JWT_AUDIENCE = "flais-dashboard";

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server misconfigured" });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim();
    const admin = await Admin.findOne({
      email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
    });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }

    // Generate Token
    const token = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Send token to frontend
      email: admin.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ email: req.admin.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
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
    res.status(200).json({ success: true, message: "Credentials updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};
