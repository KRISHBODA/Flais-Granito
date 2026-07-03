const express = require("express");
const router = express.Router();
const { loginAdmin, getAdminProfile, updateAdminProfile } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { createRateLimit } = require("../middleware/rateLimit");
const uploadService = require("../services/storage/UploadService");

const loginLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

const sensitiveUploadLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many upload/delete requests. Please try again later.",
});

// @route   POST /api/admin/login
router.post("/login", loginLimiter, loginAdmin);

// @route   GET /api/admin/profile
router.get("/profile", protect, getAdminProfile);

// @route   PUT /api/admin/profile
router.put("/profile", protect, updateAdminProfile);

// @route   POST /api/admin/upload
// @desc    Unified file upload to local storage using UploadService
// @access  Private
router.post("/upload", protect, sensitiveUploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { category, subcategory } = req.body;
    
    // Upload via service
    const result = await uploadService.upload(req.file, category, subcategory);

    return res.status(200).json({
      success: true,
      fileUrl: result.url,
      path: result.path,
      fileName: result.originalName,
      mimetype: result.mimetype,
      size: result.size,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

// @route   DELETE /api/admin/upload
// @desc    Unified file delete from local storage using UploadService
// @access  Private
router.delete("/upload", protect, sensitiveUploadLimiter, async (req, res) => {
  try {
    const { path: relativePath } = req.body;
    if (!relativePath) {
      return res.status(400).json({ success: false, message: "File path is required for deletion" });
    }

    const result = await uploadService.delete(relativePath);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deleted: result.deleted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Deletion failed" });
  }
});

module.exports = router;
