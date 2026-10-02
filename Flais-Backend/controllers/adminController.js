const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");
const crypto = require("crypto");
const { encryptData, decryptData, hashData } = require("../utils/crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = "flais-admin";
const JWT_AUDIENCE = "flais-dashboard";
const MIN_PASSWORD_LENGTH = 8;

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

    if (admin.isActive === false) {
      return res.status(403).json({ success: false, message: "Account disabled." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }

    if (admin.role === "superadmin") {
      const phase = admin.twoFactorEnabled ? "VERIFY" : "SETUP";
      const challengeToken = jwt.sign(
        { id: admin._id, twoFactorPhase: phase },
        JWT_SECRET,
        { expiresIn: "5m", issuer: JWT_ISSUER, audience: "flais-2fa" }
      );

      if (phase === "SETUP") {
        return res.status(200).json({
          success: true,
          requires2FASetup: true,
          challengeToken
        });
      } else {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          challengeToken
        });
      }
    }

    // Normal Admin Login Flow
    const token = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Send token to frontend
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      requirePasswordChange: admin.mustChangePassword || false
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
    res.status(200).json({ 
      success: true,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions,
      isActive: req.admin.isActive
    });
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
      if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        });
      }
      admin.password = password; 
      // Note: The pre-save hook in models/Admin.js will automatically hash this
    }

    await admin.save();
    res.status(200).json({ success: true, message: "Credentials updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = newPassword;
    admin.mustChangePassword = false;
    await admin.save();

    res.status(200).json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Password change failed", error: error.message });
  }
};

exports.setup2FA = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin || admin.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: "2FA already enabled or admin not found." });
    }

    const secret = authenticator.generateSecret();
    admin.pendingTwoFactorSecretEncrypted = encryptData(secret);
    await admin.save();

    const otpauthUrl = authenticator.keyuri(admin.email, "Flais Granito", secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    res.status(200).json({
      success: true,
      qrCodeDataUrl,
      manualSecret: secret
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to setup 2FA" });
  }
};

exports.verifySetup2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "TOTP token is required." });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin || admin.twoFactorEnabled || !admin.pendingTwoFactorSecretEncrypted) {
      return res.status(400).json({ success: false, message: "Invalid state for 2FA setup verification." });
    }

    const secret = decryptData(admin.pendingTwoFactorSecretEncrypted);
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    // Generate recovery codes
    const rawRecoveryCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
    const hashedRecoveryCodes = rawRecoveryCodes.map(code => hashData(code));

    admin.twoFactorSecretEncrypted = admin.pendingTwoFactorSecretEncrypted;
    admin.pendingTwoFactorSecretEncrypted = undefined;
    admin.twoFactorEnabled = true;
    admin.twoFactorVerifiedAt = new Date();
    admin.twoFactorRecoveryCodes = hashedRecoveryCodes;
    await admin.save();

    const normalToken = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
      token: normalToken,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      requirePasswordChange: admin.mustChangePassword || false,
      recoveryCodes: rawRecoveryCodes // Only return once!
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify 2FA setup" });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "TOTP token is required." });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecretEncrypted) {
      return res.status(400).json({ success: false, message: "2FA is not properly enabled." });
    }

    const secret = decryptData(admin.twoFactorSecretEncrypted);
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    const normalToken = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: normalToken,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      requirePasswordChange: admin.mustChangePassword || false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to verify 2FA" });
  }
};

exports.recover2FA = async (req, res) => {
  try {
    const { recoveryCode } = req.body;
    if (!recoveryCode) {
      return res.status(400).json({ success: false, message: "Recovery code is required." });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: "2FA is not properly enabled." });
    }

    const hashedInputCode = hashData(recoveryCode);
    const codeIndex = admin.twoFactorRecoveryCodes.indexOf(hashedInputCode);

    if (codeIndex === -1) {
      return res.status(401).json({ success: false, message: "Invalid recovery code." });
    }

    admin.twoFactorRecoveryCodes.splice(codeIndex, 1);
    await admin.save();

    const normalToken = jwt.sign(
      { id: admin._id },
      JWT_SECRET,
      { expiresIn: "1d", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    res.status(200).json({
      success: true,
      message: "Login successful via recovery code",
      token: normalToken,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      requirePasswordChange: admin.mustChangePassword || false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to recover 2FA" });
  }
};
