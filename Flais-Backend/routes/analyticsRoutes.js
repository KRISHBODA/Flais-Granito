const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { logAnalyticsEvent, getAnalyticsSummary } = require("../controllers/analyticsController");

router.post("/events", logAnalyticsEvent);
router.get("/summary", protect, getAnalyticsSummary);

module.exports = router;
