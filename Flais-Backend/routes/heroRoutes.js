const express = require("express");
const router = express.Router();
const {
  createHeroSlide,
  getHeroSlides,
  deleteHeroSlide,
  updateHeroSlide,
} = require("../controllers/heroController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

// Public Route
router.get("/", getHeroSlides);

// Protected Routes (Admin)
router.post("/", protect, upload.single("image"), createHeroSlide);
router.put("/:id", protect, upload.single("image"), updateHeroSlide);
router.delete("/:id", protect, deleteHeroSlide);

module.exports = router;
