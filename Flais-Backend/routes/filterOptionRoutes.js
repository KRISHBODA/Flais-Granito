const express = require("express");
const router = express.Router();
const {
  getFilterOptions,
  createFilterOption,
  deleteFilterOption,
  updateFilterOption,
} = require("../controllers/filterOptionController");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getFilterOptions);

// Protected Routes (Admin)
router.post("/", protect, createFilterOption);
router.put("/:id", protect, updateFilterOption);
router.delete("/:id", protect, deleteFilterOption);

module.exports = router;
