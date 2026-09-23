const websiteNodeService = require("../services/WebsiteNodeService");
const websiteFileSystemProvider = require("../services/storage/WebsiteFileSystemProvider");
const WebsiteNode = require("../models/WebsiteNode");

// @desc    Get website nodes by parentId
// @route   GET /api/admin/website-nodes
// @access  Private/Admin
const getNodes = async (req, res, next) => {
  try {
    const parentId = req.query.parentId || null;
    const nodes = await WebsiteNode.find({ parentId }).sort({ type: -1, name: 1 });
    return res.status(200).json({ success: true, data: nodes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get node by ID
// @route   GET /api/admin/website-nodes/:id
// @access  Private/Admin
const getNodeById = async (req, res, next) => {
  try {
    const node = await WebsiteNode.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ success: false, message: "Node not found" });
    }
    return res.status(200).json({ success: true, data: node });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new folder
// @route   POST /api/admin/website-nodes/folder
// @access  Private/Admin
const createFolder = async (req, res, next) => {
  try {
    const { parentId, name } = req.body;
    const node = await websiteNodeService.createFolder(parentId, name);
    return res.status(201).json({ success: true, data: node, message: "Folder created successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new file
// @route   POST /api/admin/website-nodes/upload
// @access  Private/Admin
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const { parentId } = req.body;
    const node = await websiteNodeService.uploadFile(parentId, req.file);
    return res.status(201).json({ success: true, data: node, message: "File uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename a node
// @route   PATCH /api/admin/website-nodes/:id/rename
// @access  Private/Admin
const renameNode = async (req, res, next) => {
  try {
    const { newName } = req.body;
    const node = await websiteNodeService.renameNode(req.params.id, newName);
    return res.status(200).json({ success: true, data: node, message: "Node renamed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Move a node
// @route   PATCH /api/admin/website-nodes/:id/move
// @access  Private/Admin
const moveNode = async (req, res, next) => {
  try {
    const { targetParentId } = req.body;
    const node = await websiteNodeService.moveNode(req.params.id, targetParentId);
    return res.status(200).json({ success: true, data: node, message: "Node moved successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a node
// @route   DELETE /api/admin/website-nodes/:id
// @access  Private/Admin
const deleteNode = async (req, res, next) => {
  try {
    await websiteNodeService.deleteNode(req.params.id);
    return res.status(200).json({ success: true, message: "Node deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a file
// @route   GET /api/admin/website-nodes/:id/download
// @access  Private/Admin
const downloadFile = async (req, res, next) => {
  try {
    const node = await WebsiteNode.findById(req.params.id);
    if (!node || node.type !== "file") {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const absolutePath = websiteFileSystemProvider.resolveWebsitePath(node.relativePath);
    return res.download(absolutePath, node.name);
  } catch (error) {
    next(error);
  }
};

// @desc    View a file inline
// @route   GET /api/admin/website-nodes/:id/view
// @access  Public
const viewFile = async (req, res, next) => {
  try {
    const node = await WebsiteNode.findById(req.params.id);
    if (!node || node.type !== "file") {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const absolutePath = websiteFileSystemProvider.resolveWebsitePath(node.relativePath);
    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Preview Sync from server
// @route   GET /api/admin/website-nodes/sync/preview
// @access  Private/Admin
const previewSync = async (req, res, next) => {
  try {
    const changes = await websiteNodeService.previewSync();
    return res.status(200).json({ success: true, data: changes });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply Sync from server
// @route   POST /api/admin/website-nodes/sync/apply
// @access  Private/Admin
const applySync = async (req, res, next) => {
  try {
    const result = await websiteNodeService.applySync();
    return res.status(200).json({ success: true, data: result, message: "Sync applied successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get breadcrumbs for a node
// @route   GET /api/admin/website-nodes/:id/breadcrumbs
// @access  Private/Admin
const getBreadcrumbs = async (req, res, next) => {
  try {
    let currentId = req.params.id;
    const breadcrumbs = [];
    
    while (currentId) {
      const node = await WebsiteNode.findById(currentId);
      if (!node) break;
      breadcrumbs.unshift(node);
      currentId = node.parentId;
    }
    
    return res.status(200).json({ success: true, data: breadcrumbs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  viewFile,
};
