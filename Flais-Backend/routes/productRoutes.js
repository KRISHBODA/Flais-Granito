const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  scanProduct,
} = require("../controllers/productController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getProducts);
router.get("/scan/:code", scanProduct);
router.get("/:id", getProductById);

// Protected Routes (Admin)
// No explicit file-count cap for product images
router.post("/", protect, upload.array("images"), createProduct);
router.put("/:id", protect, upload.array("images"), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
