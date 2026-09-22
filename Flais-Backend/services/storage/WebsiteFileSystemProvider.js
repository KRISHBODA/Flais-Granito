const path = require("path");
const fs = require("fs");

class WebsiteFileSystemProvider {
  constructor() {
    // Determine the root for website contents.
    // If not provided in environment, default to a 'website-content' directory in the current working directory.
    if (process.env.NODE_ENV === "production" && !process.env.WEBSITE_CONTENT_ROOT) {
      throw new Error("WEBSITE_CONTENT_ROOT is required in production environment");
    }
    this.storageRoot = path.resolve(
      process.env.WEBSITE_CONTENT_ROOT || path.join(process.cwd(), "website-content")
    );
  }

  /**
   * Central resolver. Every filesystem operation MUST go through here.
   * Validates against path traversal and ensures it stays within the WEBSITE_CONTENT_ROOT.
   */
  resolveWebsitePath(relativePath) {
    if (!relativePath && relativePath !== "") {
      throw new Error("Relative path is required");
    }

    // Ensure it doesn't contain null bytes
    if (relativePath.indexOf('\0') !== -1) {
      throw new Error("Security Violation: Null byte in path");
    }

    // Reject absolute paths passed as relative path
    if (path.isAbsolute(relativePath)) {
      throw new Error("Security Violation: Absolute paths are not allowed");
    }

    // Resolve absolute path and verify containment
    const absolutePath = path.resolve(this.storageRoot, relativePath);
    
    // Check if relative to root starts with '..' or is absolute (should not happen on normalized paths, but safe)
    const relativeToRoot = path.relative(this.storageRoot, absolutePath);
    if (
      relativeToRoot.startsWith("..") || 
      path.isAbsolute(relativeToRoot)
    ) {
      throw new Error("Security Violation: Path traversal detected");
    }

    return absolutePath;
  }

  async exists(relativePath) {
    try {
      const absolutePath = this.resolveWebsitePath(relativePath);
      await fs.promises.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  async createFolder(relativePath) {
    const absolutePath = this.resolveWebsitePath(relativePath);
    if (!fs.existsSync(absolutePath)) {
      await fs.promises.mkdir(absolutePath, { recursive: true });
    }
    return absolutePath;
  }

  async saveFile(relativePath, buffer) {
    const absolutePath = this.resolveWebsitePath(relativePath);
    const parentDir = path.dirname(absolutePath);
    
    // Ensure parent directory exists
    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(absolutePath, buffer);
    const stats = await fs.promises.stat(absolutePath);

    return {
      absolutePath,
      relativePath,
      size: stats.size,
    };
  }

  async rename(oldRelativePath, newRelativePath) {
    const oldAbsolute = this.resolveWebsitePath(oldRelativePath);
    const newAbsolute = this.resolveWebsitePath(newRelativePath);

    if (!fs.existsSync(oldAbsolute)) {
      throw new Error(`Source path does not exist: ${oldRelativePath}`);
    }

    if (fs.existsSync(newAbsolute)) {
      throw new Error(`Destination path already exists: ${newRelativePath}`);
    }

    await fs.promises.rename(oldAbsolute, newAbsolute);
    return { oldAbsolute, newAbsolute };
  }

  async move(oldRelativePath, newRelativePath) {
    return this.rename(oldRelativePath, newRelativePath);
  }

  async deleteRecursive(relativePath) {
    // Avoid deleting the root directory!
    if (relativePath === "" || relativePath === "/" || relativePath === ".") {
       throw new Error("Security Violation: Cannot delete root directory");
    }

    const absolutePath = this.resolveWebsitePath(relativePath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.rm(absolutePath, { recursive: true, force: true });
      return { deleted: true };
    }
    return { deleted: false };
  }

  async getStats(relativePath) {
    const absolutePath = this.resolveWebsitePath(relativePath);
    const stats = await fs.promises.stat(absolutePath);
    return stats;
  }

  async readDir(relativePath) {
    const absolutePath = this.resolveWebsitePath(relativePath);
    const dirents = await fs.promises.readdir(absolutePath, { withFileTypes: true });
    return dirents;
  }
}

module.exports = new WebsiteFileSystemProvider();
