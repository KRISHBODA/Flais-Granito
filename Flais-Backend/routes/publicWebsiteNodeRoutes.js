const express = require("express");
const router = express.Router();
const {
  resolvePath,
  getChildren,
} = require("../controllers/publicWebsiteNodeController");

// @route   GET /api/public/website-nodes/resolve
router.get("/resolve", resolvePath);

// @route   GET /api/public/website-nodes/:id/children
router.get("/:id/children", getChildren);

module.exports = router;
