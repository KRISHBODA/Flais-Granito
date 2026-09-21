const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  logAnalyticsEvent, 
  getAnalyticsSummary,
  getCollectionPhotosSummary 
} = require("../controllers/analyticsController");

router.post("/events", logAnalyticsEvent);
router.get("/summary", protect, getAnalyticsSummary);
router.get("/collection-photos", protect, getCollectionPhotosSummary);

module.exports = router;
