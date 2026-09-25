const express = require("express");
const router = express.Router();
const {
  createHeroSlide,
  getHeroSlides,
  deleteHeroSlide,
  updateHeroSlide,
} = require("../controllers/heroController");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Route
router.get("/", getHeroSlides);

// Protected Routes (Admin)
router.post("/", protect, authorize("home"), upload.single("image"), createHeroSlide);
router.put("/:id", protect, authorize("home"), upload.single("image"), updateHeroSlide);
router.delete("/:id", protect, authorize("home"), deleteHeroSlide);

module.exports = router;
