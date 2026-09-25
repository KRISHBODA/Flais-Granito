const express = require("express");
const router = express.Router();
const { getUsers, createUser, updateUser, resetUserPassword } = require("../controllers/adminUsersController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// All routes here are for super admins only
router.use(protect, superAdminOnly);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.post("/:id/reset-password", resetUserPassword);

module.exports = router;
