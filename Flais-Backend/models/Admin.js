const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Admin User" },
  role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  
  // 2FA Fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecretEncrypted: { type: String },
  pendingTwoFactorSecretEncrypted: { type: String },
  twoFactorVerifiedAt: { type: Date },
  twoFactorRecoveryCodes: { type: [String], default: [] }
}, { timestamps: true });

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Admin", adminSchema);