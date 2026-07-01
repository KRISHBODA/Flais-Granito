const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getFlaisGuidePage, upsertFlaisGuidePage } = require("../controllers/flaisGuideController");

router.get("/", getFlaisGuidePage);
router.put("/", protect, upsertFlaisGuidePage);

module.exports = router;
