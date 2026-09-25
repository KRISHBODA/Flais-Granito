const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Protected Routes (Admin)
router.post("/", protect, authorize("blog"), upload.single("image"), createBlog);
router.put("/:id", protect, authorize("blog"), upload.single("image"), updateBlog);
router.delete("/:id", protect, authorize("blog"), deleteBlog);

module.exports = router;
