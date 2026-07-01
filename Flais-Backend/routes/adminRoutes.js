const express = require("express");
const router = express.Router();
const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");
const { loginAdmin, getAdminProfile, updateAdminProfile } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const chunkUpload = require("../middleware/chunkUpload");
const videoUpload = require("../middleware/videoUpload");
const upload = require("../middleware/upload");
const { videoUploadR2, uploadToR2, uploadImageToR2, deleteFromR2 } = require("../middleware/r2Upload");
const cloudinary = require("../config/cloudinary");
const { createRateLimit } = require("../middleware/rateLimit");
const { URLSearchParams } = require("url");
const rawUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const loginLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

const sensitiveUploadLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many upload/signature requests. Please try again later.",
});

// @route   POST /api/admin/login
router.post("/login", loginLimiter, loginAdmin);

// @route   GET /api/admin/profile
router.get("/profile", protect, getAdminProfile);

// @route   PUT /api/admin/profile
router.put("/profile", protect, updateAdminProfile);

router.get("/cloudinary-config", protect, sensitiveUploadLimiter, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to load Cloudinary config" });
  }
});

router.post("/cloudinary-signature", protect, sensitiveUploadLimiter, (req, res) => {
  try {
    const paramsToSign = req.body?.paramsToSign || req.body || {};
    const normalizedParams = typeof paramsToSign === "string"
      ? Object.fromEntries(new URLSearchParams(paramsToSign))
      : paramsToSign;

    const signature = cloudinary.utils.api_sign_request(
      normalizedParams,
      process.env.CLOUDINARY_API_SECRET
    );


    return res.status(200).json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      signature,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to generate signature" });
  }
});

router.post("/upload-file", protect, sensitiveUploadLimiter, videoUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;


    return res.status(200).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      publicId: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

router.post("/upload-file-cloudinary", protect, sensitiveUploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = req.file.path || req.file.secure_url || "";


    return res.status(200).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      publicId: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

router.post("/upload-file-cloudinary-raw", protect, sensitiveUploadLimiter, rawUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "flais-granito",
          resource_type: "raw",
          public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const fileUrl = uploadResult?.secure_url || uploadResult?.url || "";


    return res.status(200).json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      publicId: uploadResult?.public_id,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
});

router.post("/upload-file-chunk", protect, sensitiveUploadLimiter, chunkUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file chunk uploaded" });
    }

    const uploadId = String(req.body.uploadId || "");
    const chunkIndex = Number(req.body.chunkIndex);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = String(req.body.fileName || req.file.originalname || "video");

    if (!uploadId || Number.isNaN(chunkIndex) || Number.isNaN(totalChunks)) {
      return res.status(400).json({ success: false, message: "Missing chunk metadata" });
    }

    const safeBase = uploadId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const tempDir = path.join(os.tmpdir(), "flais-granito-chunks", safeBase);
    const tempFile = path.join(tempDir, `${safeBase}.upload`);
    fs.mkdirSync(tempDir, { recursive: true });


    fs.appendFileSync(tempFile, req.file.buffer);

    const isFinalChunk = chunkIndex + 1 === totalChunks;
    if (!isFinalChunk) {
      return res.status(200).json({
        success: true,
        done: false,
        chunkIndex,
        totalChunks,
      });
    }

    const publicId = `${Date.now()}-${fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")}`;


    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        tempFile,
        (result) => {
          if (result?.error) {
            reject(result.error);
            return;
          }
          resolve(result);
        },
        {
          resource_type: "video",
          folder: "flais-granito",
          public_id: publicId,
          overwrite: true,
          chunk_size: 20 * 1024 * 1024,
        }
      );
    });

    fs.rmSync(tempDir, { recursive: true, force: true });

    const fileUrl =
      uploadResult?.secure_url ||
      uploadResult?.url ||
      uploadResult?.secureUrl ||
      uploadResult?.filepath ||
      "";


    return res.status(200).json({
      success: true,
      done: true,
      message: "File uploaded successfully",
      fileUrl,
      fileName,
      publicId: uploadResult.public_id || publicId,
      mimetype: uploadResult.resource_type === "video" ? req.file.mimetype : uploadResult.resource_type,
    });
  } catch (error) {
    try {
      const uploadId = String(req.body?.uploadId || "");
      if (uploadId) {
        const safeBase = uploadId.replace(/[^a-zA-Z0-9_-]/g, "_");
        const tempDir = path.join(os.tmpdir(), "flais-granito-chunks", safeBase);
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
    }
    return res.status(500).json({ success: false, message: error.message || "Chunk upload failed" });
  }
});

// ============ CLOUDFLARE R2 UPLOAD ENDPOINTS ============

// @route   POST /api/admin/upload-video-r2
// @desc    Upload video to Cloudflare R2
// @access  Private
router.post("/upload-video-r2", protect, sensitiveUploadLimiter, videoUploadR2.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file uploaded" });
    }

    // Validate R2 environment variables
    if (!process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return res.status(500).json({
        success: false,
        message: "R2 configuration missing. Please check .env variables.",
      });
    }

    const uploadResult = await uploadToR2(req.file, "videos");

    return res.status(200).json({
      success: true,
      fileUrl: uploadResult.url,
      fileName: req.file.originalname,
      r2Key: uploadResult.key,
      mimetype: uploadResult.mimetype,
      size: uploadResult.size,
      storage: "r2",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Video upload to R2 failed",
    });
  }
});

// @route   POST /api/admin/upload-image-r2
// @desc    Upload image to Cloudflare R2
// @access  Private
router.post("/upload-image-r2", protect, sensitiveUploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    // Validate R2 environment variables
    if (!process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return res.status(500).json({
        success: false,
        message: "R2 configuration missing. Please check .env variables.",
      });
    }

    // Create buffer from file if it's from Cloudinary storage
    const fileBuffer = req.file.buffer || Buffer.from(req.file);
    const mockFile = {
      ...req.file,
      buffer: fileBuffer,
    };

    const uploadResult = await uploadImageToR2(mockFile, "images");

    return res.status(200).json({
      success: true,
      fileUrl: uploadResult.url,
      fileName: req.file.originalname,
      r2Key: uploadResult.key,
      mimetype: uploadResult.mimetype,
      size: uploadResult.size,
      storage: "r2",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Image upload to R2 failed",
    });
  }
});

// @route   DELETE /api/admin/delete-r2-file
// @desc    Delete file from Cloudflare R2
// @access  Private
router.delete("/delete-r2-file", protect, sensitiveUploadLimiter, async (req, res) => {
  try {
    const { r2Key } = req.body;

    if (!r2Key) {
      return res.status(400).json({ success: false, message: "R2 key is required" });
    }

    const deleteResult = await deleteFromR2(r2Key);

    return res.status(200).json({
      success: true,
      message: "File deleted from R2 successfully",
      r2Key,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete file from R2",
    });
  }
});

// @route   GET /api/admin/r2-config
// @desc    Get R2 configuration (for frontend)
// @access  Private
router.get("/r2-config", protect, sensitiveUploadLimiter, (req, res) => {
  try {
    const r2Configured = !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
    );

    return res.status(200).json({
      success: true,
      r2Configured,
      bucketName: process.env.R2_BUCKET_NAME || "Not configured",
      publicUrl: process.env.R2_PUBLIC_URL || "Not configured",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get R2 config",
    });
  }
});

module.exports = router;
