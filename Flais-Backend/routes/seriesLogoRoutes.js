const express = require("express");
const router = express.Router();
const {
  createSeriesLogo,
  getSeriesLogos,
  deleteSeriesLogo,
  updateSeriesLogo,
} = require("../controllers/seriesLogoController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

// Public Route
router.get("/", getSeriesLogos);

// Protected Routes (Admin)
router.post("/", protect, upload.single("image"), createSeriesLogo);
router.put("/:id", protect, upload.single("image"), updateSeriesLogo);
router.delete("/:id", protect, deleteSeriesLogo);

module.exports = router;
