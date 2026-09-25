const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = "flais-admin";
const JWT_AUDIENCE = "flais-dashboard";

const protect = async (req, res, next) => {
  let token;

  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Server misconfigured" });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      req.admin = await Admin.findById(decoded.id).select("-password");

      if (!req.admin) {
        return res.status(401).json({ success: false, message: "Not authorized, admin not found" });
      }

      if (req.admin.isActive === false) {
        return res.status(403).json({ success: false, message: "Account disabled. Please contact Super Admin." });
      }

      if (req.admin.mustChangePassword) {
        if (!req.originalUrl.includes('/change-password')) {
          return res.status(403).json({ success: false, requirePasswordChange: true, message: "Must change password" });
        }
      }

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};


const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (req.admin.role === "superadmin") {
      return next();
    }
    if (req.admin.permissions && req.admin.permissions.includes(permission)) {
      return next();
    }
    return res.status(403).json({ success: false, message: `Forbidden: requires ${permission} permission` });
  };
};

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden: Super Admin only" });
};

module.exports = { protect, authorize, superAdminOnly };
