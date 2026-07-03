const localStorageProvider = require("./LocalStorageProvider");
const validationService = require("./ValidationService");
const filenameGenerator = require("./FilenameGenerator");
const pathResolver = require("./PathResolver");

class UploadService {
  async upload(file, category, subcategory) {
    if (!file || !file.buffer) {
      throw new Error("Invalid file upload: File buffer is missing");
    }

    // 1. Run core validation rules
    validationService.validate(file, category);

    // 2. Generate clean, unique filename
    const filename = filenameGenerator.generate(file.originalname);

    // 3. Map to path layout
    const relativePath = pathResolver.buildPath(file.mimetype, category, subcategory, filename);

    // 4. Save to disk
    const saveResult = await localStorageProvider.save(file.buffer, relativePath);

    // 5. Generate full public URL
    const url = localStorageProvider.getPublicUrl(relativePath);

    return {
      path: relativePath,
      url,
      size: saveResult.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
    };
  }

  async replace(file, oldRelativePath, category, subcategory) {
    // Save new asset first to prevent losing data on save error
    const uploadResult = await this.upload(file, category, subcategory);

    // Delete old asset after successful write
    if (oldRelativePath) {
      // Extract relative path from absolute URL if necessary
      const cleanPath = this._extractRelativePath(oldRelativePath);
      await this.delete(cleanPath);
    }

    return uploadResult;
  }

  async delete(relativePath) {
    if (!relativePath) {
      return { deleted: false };
    }
    const cleanPath = this._extractRelativePath(relativePath);
    return await localStorageProvider.delete(cleanPath);
  }

  getUrl(relativePath) {
    if (!relativePath) {
      return "";
    }
    // Return absolute URLs as-is (for legacy compatibility during migration)
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return relativePath;
    }
    return localStorageProvider.getPublicUrl(relativePath);
  }

  // Internal helper to strip VITE_STORAGE_URL or STORAGE_BASE_URL if passed absolute path
  _extractRelativePath(urlOrPath) {
    if (!urlOrPath) return "";
    
    // If it's a URL, extract the path segment after '/media/' or the domain
    if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
      try {
        const url = new URL(urlOrPath);
        let pathname = url.pathname; // e.g. "/media/images/..."
        
        // Remove /media prefix if configured
        const mediaPrefix = "/media/";
        if (pathname.startsWith(mediaPrefix)) {
          pathname = pathname.substring(mediaPrefix.length);
        } else if (pathname.startsWith("/")) {
          pathname = pathname.substring(1);
        }
        return pathname;
      } catch (err) {
        return urlOrPath;
      }
    }
    return urlOrPath;
  }
}

module.exports = new UploadService();
