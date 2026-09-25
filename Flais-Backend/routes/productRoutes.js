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
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getProducts);
router.get("/scan/:code", scanProduct);
router.get("/:id", getProductById);

// Protected Routes (Admin)
// Accepts any file fields (e.g. previewImages for 3D preview, images for JPGs)
router.post("/", protect, authorize("collection"), upload.any(), createProduct);
router.put("/:id", protect, authorize("collection"), upload.any(), updateProduct);
router.delete("/:id", protect, authorize("collection"), deleteProduct);

module.exports = router;
