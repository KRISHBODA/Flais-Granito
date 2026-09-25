const express = require("express");
const router = express.Router();
const {
  createSeriesLogo,
  getSeriesLogos,
  deleteSeriesLogo,
  updateSeriesLogo,
} = require("../controllers/seriesLogoController");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Route
router.get("/", getSeriesLogos);

// Protected Routes (Admin)
router.post("/", protect, authorize("home"), upload.single("image"), createSeriesLogo);
router.put("/:id", protect, authorize("home"), upload.single("image"), updateSeriesLogo);
router.delete("/:id", protect, authorize("home"), deleteSeriesLogo);

module.exports = router;
