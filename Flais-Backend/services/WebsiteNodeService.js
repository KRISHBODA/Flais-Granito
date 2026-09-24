const WebsiteNode = require("../models/WebsiteNode");
const websiteFileSystemProvider = require("./storage/WebsiteFileSystemProvider");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const MAX_WEBSITE_UPLOAD_SIZE = parseInt(process.env.MAX_WEBSITE_UPLOAD_SIZE || 52428800, 10);


class WebsiteNodeService {
  /**
   * Helper to fetch a node by ID.
   */
  async getNode(nodeId) {
    if (!nodeId) return null;
    return await WebsiteNode.findById(nodeId);
  }

  /**
   * Validate file extension and size.
   */
  validateFile(file) {
    if (file.size > MAX_WEBSITE_UPLOAD_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_WEBSITE_UPLOAD_SIZE} bytes.`);
    }


  }

  /**
   * Validate a name to prevent path traversals and invalid characters.
   */
  validateName(name) {
    if (!name || typeof name !== "string") {
      throw new Error("Invalid name.");
    }
    // Reject names with slashes, backslashes, or null bytes, or dots if they represent '..'
    if (/[\\/\0]/.test(name) || name === "." || name === "..") {
      throw new Error("Security Violation: Invalid node name.");
    }
  }

  /**
   * Calculate the slug for uniqueness.
   */
  calculateSlug(name) {
    return name.toLowerCase();
  }

  /**
   * Calculate the relative path for a new node.
   */
  async calculateRelativePath(parentId, name) {
    if (!parentId) {
      return name;
    }
    const parentNode = await WebsiteNode.findById(parentId);
    if (!parentNode) {
      throw new Error("Parent node not found.");
    }
    if (parentNode.type !== "folder") {
      throw new Error("Cannot create a node inside a file.");
    }
    // E.g., parent="360/catalog", name="slabs" -> "360/catalog/slabs"
    return `${parentNode.relativePath}/${name}`;
  }

  /**
   * Create a new folder.
   */
  async createFolder(parentId, name) {
    this.validateName(name);

    const slug = this.calculateSlug(name);
    const existing = await WebsiteNode.findOne({ parentId: parentId || null, slug });
    if (existing) {
      throw new Error(`A node with name ${name} already exists in this folder.`);
    }

    const relativePath = await this.calculateRelativePath(parentId, name);

    // 1. Filesystem Operation
    await websiteFileSystemProvider.createFolder(relativePath);

    // 2. Database Operation
    try {
      const node = new WebsiteNode({
        name,
        slug,
        type: "folder",
        parentId: parentId || null,
        relativePath,
      });
      await node.save();
      return node;
    } catch (dbError) {
      // Rollback physical creation only if it's not a duplicate key error
      if (dbError.code === 11000) {
        throw new Error(`A node with name ${name} already exists in this folder.`);
      }
      try {
        await websiteFileSystemProvider.deleteRecursive(relativePath);
      } catch (e) {
        console.error("Failed to rollback filesystem folder creation:", e);
      }
      throw dbError;
    }
  }

  /**
   * Upload a new file.
   */
  async uploadFile(parentId, file) {
    this.validateFile(file);
    let name = file.originalname;

    const isJpeg = file.mimetype === 'image/jpeg' || 
                   path.extname(name).toLowerCase() === '.jpg' || 
                   path.extname(name).toLowerCase() === '.jpeg';
    
    if (isJpeg) {
      name = '1.jpeg';
    }

    this.validateName(name);

    const slug = this.calculateSlug(name);
    const existing = await WebsiteNode.findOne({ parentId: parentId || null, slug });
    
    const relativePath = await this.calculateRelativePath(parentId, name);
    const ext = path.extname(name).toLowerCase();

    if (existing) {
      if (isJpeg) {
        // Overwrite the existing 1.jpeg
        const fsResult = await websiteFileSystemProvider.saveFile(relativePath, file.buffer);
        
        existing.mimeType = file.mimetype;
        existing.fileSize = fsResult.size;
        existing.extension = ext;
        await existing.save();
        
        return existing;
      } else {
        throw new Error(`A node with name ${name} already exists in this folder.`);
      }
    }

    // 1. Filesystem Operation
    const fsResult = await websiteFileSystemProvider.saveFile(relativePath, file.buffer);

    // 2. Database Operation
    try {
      const node = new WebsiteNode({
        name,
        slug,
        type: "file",
        parentId: parentId || null,
        relativePath,
        mimeType: file.mimetype,
        fileSize: fsResult.size,
        extension: ext,
      });
      await node.save();
      return node;
    } catch (dbError) {
      // Rollback physical file only if it's not a duplicate key error
      if (dbError.code === 11000) {
        throw new Error(`A node with name ${name} already exists in this folder.`);
      }
      try {
        await websiteFileSystemProvider.deleteRecursive(relativePath);
      } catch (e) {
        console.error("Failed to rollback filesystem file creation:", e);
      }
      throw dbError;
    }
  }

  /**
   * Delete a node (folder or file).
   */
  async deleteNode(nodeId) {
    const node = await WebsiteNode.findById(nodeId);
    if (!node) {
      throw new Error("Node not found.");
    }

    // 1. Database Operation - We do this first because if FS fails, DB is out of sync, but if we do FS first and DB fails, we lose data.
    // Actually, hard delete: FS delete first. If DB fails, the file is gone but DB has orphan. DB can be cleaned.
    // Let's do FS first, it's the actual source of truth for contents.
    await websiteFileSystemProvider.deleteRecursive(node.relativePath);

    // 2. Database Operation
    if (node.type === "file") {
      await WebsiteNode.deleteOne({ _id: nodeId });
    } else {
      // Delete the folder and all descendants.
      // E.g., relativePath = "360/catalog"
      // We want to delete where relativePath == "360/catalog" OR starts with "360/catalog/"
      const regex = new RegExp(`^${this.escapeRegExp(node.relativePath)}(/|$)`);
      await WebsiteNode.deleteMany({ relativePath: regex });
    }

    return { success: true };
  }

  /**
   * Rename a node.
   */
  async renameNode(nodeId, newName) {
    this.validateName(newName);

    const node = await WebsiteNode.findById(nodeId);
    if (!node) {
      throw new Error("Node not found.");
    }

    if (node.name === newName) {
      return node;
    }

    const newSlug = this.calculateSlug(newName);
    const existing = await WebsiteNode.findOne({ parentId: node.parentId, slug: newSlug });
    if (existing) {
      throw new Error(`A node with name ${newName} already exists in this folder.`);
    }

    // Calculate new relative path
    const parentPath = node.relativePath.substring(0, node.relativePath.length - node.name.length - (node.parentId ? 1 : 0));
    // If it's root level, parentPath is empty.
    let newRelativePath = newName;
    if (node.parentId && parentPath.length > 0) {
      newRelativePath = `${parentPath}/${newName}`;
    }

    const oldRelativePath = node.relativePath;

    // 1. Filesystem Operation
    await websiteFileSystemProvider.rename(oldRelativePath, newRelativePath);

    // 2. Database Operation
    try {
      node.name = newName;
      node.slug = newSlug;
      node.relativePath = newRelativePath;
      if (node.type === "file") {
        node.extension = path.extname(newName).toLowerCase();
      }
      await node.save();

      // If it's a folder, update all descendant paths
      if (node.type === "folder") {
        const regex = new RegExp(`^${this.escapeRegExp(oldRelativePath)}/`);
        const descendants = await WebsiteNode.find({ relativePath: regex });
        for (const desc of descendants) {
          // Replace the prefix
          desc.relativePath = desc.relativePath.replace(oldRelativePath, newRelativePath);
          await desc.save();
        }
      }

      return node;
    } catch (dbError) {
      // Rollback FS
      try {
        await websiteFileSystemProvider.rename(newRelativePath, oldRelativePath);
      } catch (e) {
        console.error("Failed to rollback filesystem rename:", e);
      }
      throw dbError;
    }
  }

  /**
   * Move a node to a different parent.
   */
  async moveNode(nodeId, targetParentId) {
    const node = await WebsiteNode.findById(nodeId);
    if (!node) {
      throw new Error("Node not found.");
    }

    // Convert ObjectIds for comparison safely
    const currentParentStr = node.parentId ? node.parentId.toString() : null;
    const targetParentStr = targetParentId ? targetParentId.toString() : null;

    if (currentParentStr === targetParentStr) {
      return node; // No move needed
    }

    // Check if destination name is taken
    const existing = await WebsiteNode.findOne({ parentId: targetParentId || null, slug: node.slug });
    if (existing) {
      throw new Error(`A node with name ${node.name} already exists in the destination folder.`);
    }

    // If moving a folder, ensure we are not moving it into itself or its descendants
    if (node.type === "folder" && targetParentId) {
      if (node._id.toString() === targetParentStr) {
        throw new Error("Cannot move a folder into itself.");
      }
      const targetParent = await WebsiteNode.findById(targetParentId);
      if (!targetParent) {
        throw new Error("Target parent not found.");
      }
      // If targetParent's path starts with node's path + "/", it's a descendant
      if (targetParent.relativePath.startsWith(`${node.relativePath}/`)) {
        throw new Error("Cannot move a folder into one of its descendants.");
      }
    }

    const newRelativePath = await this.calculateRelativePath(targetParentId, node.name);
    const oldRelativePath = node.relativePath;

    // 1. Filesystem Operation
    await websiteFileSystemProvider.move(oldRelativePath, newRelativePath);

    // 2. Database Operation
    try {
      node.parentId = targetParentId || null;
      node.relativePath = newRelativePath;
      await node.save();

      // Update descendants if folder
      if (node.type === "folder") {
        const regex = new RegExp(`^${this.escapeRegExp(oldRelativePath)}/`);
        const descendants = await WebsiteNode.find({ relativePath: regex });
        for (const desc of descendants) {
          desc.relativePath = desc.relativePath.replace(oldRelativePath, newRelativePath);
          await desc.save();
        }
      }

      return node;
    } catch (dbError) {
      // Rollback FS
      try {
        await websiteFileSystemProvider.move(newRelativePath, oldRelativePath);
      } catch (e) {
        console.error("Failed to rollback filesystem move:", e);
      }
      throw dbError;
    }
  }

  /**
   * Preview Sync from server to database.
   * Recursively scans WEBSITE_CONTENT_ROOT and compares with DB.
   */
  async previewSync() {
    const changes = {
      newNodes: [],
      metadataUpdates: [],
      conflicts: [],
    };

    const scanDirectory = async (dirRelativePath, parentId) => {
      try {
        const dirents = await websiteFileSystemProvider.readDir(dirRelativePath);

        for (const dirent of dirents) {
          const name = dirent.name;
          const slug = this.calculateSlug(name);
          const childRelativePath = dirRelativePath ? `${dirRelativePath}/${name}` : name;
          const isDir = dirent.isDirectory();
          
          const dbNode = await WebsiteNode.findOne({ parentId: parentId || null, slug });

          if (!dbNode) {
            changes.newNodes.push({
              name,
              type: isDir ? "folder" : "file",
              parentId,
              relativePath: childRelativePath,
            });
          } else {
            if ((isDir && dbNode.type !== "folder") || (!isDir && dbNode.type !== "file")) {
              changes.conflicts.push({
                relativePath: childRelativePath,
                message: `Type mismatch. DB says ${dbNode.type}, FS says ${isDir ? "folder" : "file"}.`,
              });
            } else if (!isDir) {
              const stats = await websiteFileSystemProvider.getStats(childRelativePath);
              if (dbNode.fileSize !== stats.size) {
                changes.metadataUpdates.push({
                  nodeId: dbNode._id,
                  relativePath: childRelativePath,
                  oldSize: dbNode.fileSize,
                  newSize: stats.size,
                });
              }
            }
          }

          if (isDir) {
            const nextParentId = dbNode ? dbNode._id : "PENDING_CREATION"; 
            // In preview, we don't have the ID for new nodes, but we can scan it anyway.
            await scanDirectory(childRelativePath, nextParentId);
          }
        }
      } catch (err) {
        console.error(`Error scanning ${dirRelativePath}:`, err.message);
      }
    };

    await scanDirectory("", null);
    return changes;
  }

  /**
   * Apply Sync from server to database.
   */
  async applySync() {
    const scanDirectory = async (dirRelativePath, parentId) => {
      let createdCount = 0;
      let updatedCount = 0;

      try {
        const dirents = await websiteFileSystemProvider.readDir(dirRelativePath);

        for (const dirent of dirents) {
          const name = dirent.name;
          const slug = this.calculateSlug(name);
          const childRelativePath = dirRelativePath ? `${dirRelativePath}/${name}` : name;
          const isDir = dirent.isDirectory();

          let dbNode = await WebsiteNode.findOne({ parentId: parentId || null, slug });

          if (!dbNode) {
            // Create missing node
            const ext = isDir ? null : path.extname(name).toLowerCase();
            const stats = isDir ? null : await websiteFileSystemProvider.getStats(childRelativePath);

            dbNode = new WebsiteNode({
              name,
              slug,
              type: isDir ? "folder" : "file",
              parentId: parentId || null,
              relativePath: childRelativePath,
              fileSize: stats ? stats.size : null,
              extension: ext,
            });
            await dbNode.save();
            createdCount++;
          } else if (!isDir) {
            // Update metadata
            const stats = await websiteFileSystemProvider.getStats(childRelativePath);
            if (dbNode.fileSize !== stats.size) {
              dbNode.fileSize = stats.size;
              await dbNode.save();
              updatedCount++;
            }
          }

          if (isDir && dbNode.type === "folder") {
            const childResult = await scanDirectory(childRelativePath, dbNode._id);
            createdCount += childResult.createdCount;
            updatedCount += childResult.updatedCount;
          }
        }
      } catch (err) {
        console.error(`Error applying sync at ${dirRelativePath}:`, err.message);
      }

      return { createdCount, updatedCount };
    };

    return await scanDirectory("", null);
  }

  /**
   * Toggle isPublished status for a node
   */
  async togglePublish(nodeId, isPublished) {
    const node = await WebsiteNode.findById(nodeId);
    if (!node) {
      throw new Error("Node not found.");
    }
    node.isPublished = isPublished;
    await node.save();
    return node;
  }

  /**
   * Get public children of a node
   */
  async getPublicChildren(parentId) {
    if (parentId) {
      // Ensure the parent is published before returning children
      const parent = await WebsiteNode.findById(parentId);
      if (!parent || !parent.isPublished) {
        throw new Error("Parent not found or not public");
      }
    }
    
    return await WebsiteNode.find({ parentId: parentId || null, isPublished: true })
      .select("-__v -createdAt -updatedAt") // Exclude internal details
      .sort({ type: -1, name: 1 });
  }

  /**
   * Resolve a relative path to a public node
   */
  async resolvePublicPath(pathStr) {
    if (!pathStr || pathStr === "/" || pathStr === "") {
      // Root level children
      return { _id: null, name: "Root", type: "folder", isPublished: true };
    }
    
    // Clean path
    const cleanPath = pathStr.replace(/^\/+|\/+$/g, "");
    
    // Generate all ancestor paths to check their publish status
    const pathParts = cleanPath.split('/');
    const pathsToCheck = [];
    let currentPath = '';
    for (const part of pathParts) {
      currentPath = currentPath ? currentPath + '/' + part : part;
      pathsToCheck.push(currentPath);
    }
    
    // Fetch the target node and all its ancestors
    const nodes = await WebsiteNode.find({ relativePath: { $in: pathsToCheck } });
    
    // Check if any part of the path is missing or unpublished
    if (nodes.length !== pathsToCheck.length || nodes.some(n => !n.isPublished)) {
      throw new Error("Path not found or not public");
    }
    
    // Return the specific target node
    const targetNode = nodes.find(n => n.relativePath === cleanPath);
    
    return targetNode;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = new WebsiteNodeService();
