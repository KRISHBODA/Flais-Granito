const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  logAnalyticsEvent, 
  getAnalyticsSummary,
  getCollectionPhotosSummary 
} = require("../controllers/analyticsController");

router.post("/events", logAnalyticsEvent);
router.get("/summary", protect, authorize("analytics"), getAnalyticsSummary);
router.get("/collection-photos", protect, authorize("analytics"), getCollectionPhotosSummary);

module.exports = router;
