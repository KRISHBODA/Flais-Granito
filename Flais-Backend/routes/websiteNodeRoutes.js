const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  getNodes,
  getNodeById,
  createFolder,
  uploadFile,
  renameNode,
  moveNode,
  deleteNode,
  downloadFile,
  previewSync,
  applySync,
  getBreadcrumbs,
} = require("../controllers/websiteNodeController");

// Apply admin protection to all routes in this file
router.use(protect);

// @route   GET /api/admin/website-nodes
router.get("/", getNodes);

// @route   GET /api/admin/website-nodes/sync/preview
router.get("/sync/preview", previewSync);

// @route   POST /api/admin/website-nodes/sync/apply
router.post("/sync/apply", applySync);

// @route   POST /api/admin/website-nodes/folder
router.post("/folder", createFolder);

// @route   POST /api/admin/website-nodes/upload
// The upload middleware uses memory storage which is safe for this application
router.post("/upload", upload.single("file"), uploadFile);

// @route   GET /api/admin/website-nodes/:id
router.get("/:id", getNodeById);

// @route   GET /api/admin/website-nodes/:id/breadcrumbs
router.get("/:id/breadcrumbs", getBreadcrumbs);

// @route   PATCH /api/admin/website-nodes/:id/rename
router.patch("/:id/rename", renameNode);

// @route   PATCH /api/admin/website-nodes/:id/move
router.patch("/:id/move", moveNode);

// @route   DELETE /api/admin/website-nodes/:id
router.delete("/:id", deleteNode);

// @route   GET /api/admin/website-nodes/:id/download
router.get("/:id/download", downloadFile);

module.exports = router;
