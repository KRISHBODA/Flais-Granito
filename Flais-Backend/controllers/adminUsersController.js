const Admin = require("../models/Admin");
const crypto = require("crypto");

const generateTempPassword = () => {
  return crypto.randomBytes(8).toString("hex") + "aA1!"; // ensure requirements
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Admin.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role, permissions } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required" });
    }
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const tempPassword = generateTempPassword();

    const user = new Admin({
      name,
      email,
      role,
      permissions: role === "superadmin" ? [] : (permissions || []),
      password: tempPassword,
      mustChangePassword: true,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      },
      tempPassword // Return it once so the Super Admin can share it securely
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create user", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role, permissions, isActive } = req.body;
    const user = await Admin.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user._id.toString() === req.admin._id.toString()) {
      if (role !== undefined && role !== "superadmin") {
        return res.status(400).json({ success: false, message: "Cannot remove your own superadmin role" });
      }
      if (isActive === false) {
        return res.status(400).json({ success: false, message: "Cannot disable yourself" });
      }
    }

    // Protect against disabling last superadmin
    if (isActive === false || (role !== undefined && role !== "superadmin")) {
      if (user.role === "superadmin") {
        const superadminCount = await Admin.countDocuments({ role: "superadmin", isActive: true });
        if (superadminCount <= 1) {
           return res.status(400).json({ success: false, message: "Cannot disable or demote the last active superadmin" });
        }
      }
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (permissions !== undefined) user.permissions = user.role === "superadmin" ? [] : permissions;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({ success: true, user: await Admin.findById(user._id).select("-password") });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    res.status(200).json({
      success: true,
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
  }
};
