const express = require("express");
const router = express.Router();
const {
  getFilterOptions,
  createFilterOption,
  deleteFilterOption,
  updateFilterOption,
} = require("../controllers/filterOptionController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getFilterOptions);

// Protected Routes (Admin)
router.post("/", protect, authorize("collection"), createFilterOption);
router.put("/:id", protect, authorize("collection"), updateFilterOption);
router.delete("/:id", protect, authorize("collection"), deleteFilterOption);

module.exports = router;
