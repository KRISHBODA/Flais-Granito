const websiteNodeService = require("../services/WebsiteNodeService");
const PUBLIC_URL_BASE = process.env.FRONTEND_URL || "https://flaisgranito.com";

const formatPublicNode = (node) => {
  if (!node) return null;
  const doc = node.toObject ? node.toObject() : node;
  
  const publicData = {
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    type: doc.type,
    relativePath: doc.relativePath,
  };

  if (doc.type === "file") {
    publicData.mimeType = doc.mimeType;
    publicData.fileSize = doc.fileSize;
    // Add public URL combining base URL and relative path
    // Assuming Nginx maps the domain root to WEBSITE_CONTENT_ROOT
    const cleanPath = doc.relativePath.startsWith("/") ? doc.relativePath.substring(1) : doc.relativePath;
    publicData.publicUrl = `${PUBLIC_URL_BASE}/${cleanPath}`;
  }

  return publicData;
};

// @desc    Resolve a path to get metadata
// @route   GET /api/public/website-nodes/resolve
// @access  Public
const resolvePath = async (req, res, next) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ success: false, message: "Path is required" });
    }
    
    const node = await websiteNodeService.resolvePublicPath(path);
    return res.status(200).json({ success: true, data: formatPublicNode(node) });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get children of a folder
// @route   GET /api/public/website-nodes/:id/children
// @access  Public
const getChildren = async (req, res, next) => {
  try {
    const { id } = req.params;
    // 'root' or empty string can map to null for root children
    const parentId = (id === "root" || !id) ? null : id;
    
    const children = await websiteNodeService.getPublicChildren(parentId);
    
    const formattedChildren = children.map(formatPublicNode);
    return res.status(200).json({ success: true, data: formattedChildren });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resolvePath,
  getChildren,
};
