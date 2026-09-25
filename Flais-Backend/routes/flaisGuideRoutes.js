const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getFlaisGuidePage, upsertFlaisGuidePage } = require("../controllers/flaisGuideController");

router.get("/", getFlaisGuidePage);
router.put("/", protect, authorize("achievement"), upsertFlaisGuidePage);

module.exports = router;
