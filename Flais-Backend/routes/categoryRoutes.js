const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getCategories);

// Protected Routes (Admin)
router.post("/", protect, authorize("collection"), createCategory);
router.put("/:id", protect, authorize("collection"), updateCategory);
router.delete("/:id", protect, authorize("collection"), deleteCategory);

module.exports = router;
