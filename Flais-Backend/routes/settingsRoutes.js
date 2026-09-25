const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingsController");

router.get("/", getSettings);
router.put("/", protect, authorize("settings"), updateSettings);

module.exports = router;
