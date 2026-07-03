const path = require("path");
const fs = require("fs");

class LocalStorageProvider {
  constructor() {
    // Resolve standard storage root from env, fallback to project-local 'uploads' folder for dev
    this.storageRoot = path.resolve(process.env.STORAGE_ROOT || path.join(__dirname, "../../uploads"));
    this.baseUrl = process.env.STORAGE_BASE_URL || "http://localhost:8000/media";
  }

  resolve(relativePath) {
    if (!relativePath) {
      throw new Error("Relative path is required for resolution");
    }
    // Resolve absolute path and verify prefix against directory traversal
    const absolutePath = path.resolve(this.storageRoot, relativePath);
    if (!absolutePath.startsWith(this.storageRoot)) {
      throw new Error("Security Violation: Path traversal detected");
    }
    return absolutePath;
  }

  async save(buffer, relativePath) {
    const absolutePath = this.resolve(relativePath);
    const parentDir = path.dirname(absolutePath);

    // Dynamic recursive folder generation
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(absolutePath, buffer);
    const stats = await fs.promises.stat(absolutePath);

    return {
      absolutePath,
      relativePath,
      size: stats.size,
    };
  }

  async delete(relativePath) {
    try {
      const absolutePath = this.resolve(relativePath);
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        return { deleted: true };
      }
      return { deleted: false };
    } catch (error) {
      // Re-throw critical security path errors
      if (error.message.includes("Security Violation")) {
        throw error;
      }
      // Return false for normal unlinks (idempotent contract)
      console.warn(`Idempotent deletion warning for ${relativePath}:`, error.message);
      return { deleted: false };
    }
  }

  async exists(relativePath) {
    try {
      const absolutePath = this.resolve(relativePath);
      return fs.existsSync(absolutePath);
    } catch (error) {
      return false;
    }
  }

  getPublicUrl(relativePath) {
    const cleanPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
    return `${this.baseUrl.replace(/\/$/, "")}/${cleanPath}`;
  }
}

module.exports = new LocalStorageProvider();
