const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected Routes (Admin)
// We allow up to 8 images to be uploaded at once
router.post("/", protect, upload.array("images", 8), createProduct);
router.put("/:id", protect, upload.array("images", 8), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;