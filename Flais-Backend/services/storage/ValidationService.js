const mimeExtensionMap = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov"],
  "video/x-m4v": [".m4v"],
};

const categoryMimeAllowlist = {
  products: ["image/jpeg", "image/png", "image/webp"],
  hero: ["image/jpeg", "image/png", "image/webp"],
  blogs: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  logos: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  categories: ["image/jpeg", "image/png", "image/webp"],
  catalogs: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  about: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
  achievements: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
  home: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
  contact: ["image/jpeg", "image/png", "image/webp"],
  collections: ["image/jpeg", "image/png", "image/webp"],
  general: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
};

const categorySizeLimits = {
  logos: 5 * 1024 * 1024, // 5MB
  products: 10 * 1024 * 1024, // 10MB
  blogs: 10 * 1024 * 1024,
  categories: 10 * 1024 * 1024,
  about: 500 * 1024 * 1024, // High size ceiling for videos inside about
  achievements: 500 * 1024 * 1024,
  home: 500 * 1024 * 1024,
  contact: 10 * 1024 * 1024,
  collections: 10 * 1024 * 1024,
  general: 500 * 1024 * 1024,
  hero: 15 * 1024 * 1024, // 15MB
  catalogs: 50 * 1024 * 1024, // 50MB (brochures / PDFs)
};

class ValidationService {
  validate(file, category) {
    if (!file) {
      throw new Error("No file payload provided for validation");
    }

    const targetCategory = category || "general";
    const allowedMimes = categoryMimeAllowlist[targetCategory] || categoryMimeAllowlist.general;
    const maxSize = categorySizeLimits[targetCategory] || categorySizeLimits.general;

    // 1. MIME Validation
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype} for category ${targetCategory}`);
    }

    // 2. Size Validation (Bypassed/Removed to allow arbitrary file sizes)

    // 3. Filename Sanitization & Security Checks
    const originalName = file.originalname;
    if (!originalName) {
      throw new Error("Invalid file upload: Original filename is missing");
    }

    // Path traversal in filename check
    if (originalName.includes("/") || originalName.includes("\\") || originalName.includes("\0")) {
      throw new Error("Security Violation: Invalid filename characters detected");
    }

    // Double extension checks (e.g. file.php.jpg)
    const dotCount = (originalName.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Check if intermediate segments are dangerous extensions
      const segments = originalName.toLowerCase().split(".");
      const dangerousExts = ["php", "html", "htm", "js", "sh", "bash", "exe", "pl", "py", "htaccess"];
      for (let i = 1; i < segments.length - 1; i++) {
        if (dangerousExts.includes(segments[i])) {
          throw new Error("Security Violation: Multi-extension attack pattern detected");
        }
      }
    }

    // 4. Extension Match Validation
    const extMatch = originalName.match(/\.[^.]+$/);
    if (!extMatch) {
      throw new Error("File extension is missing");
    }
    const ext = extMatch[0].toLowerCase();
    const validExtensions = mimeExtensionMap[file.mimetype];
    
    if (!validExtensions || !validExtensions.includes(ext)) {
      throw new Error(`Filename extension ${ext} does not match verified MIME type ${file.mimetype}`);
    }

    return true;
  }
}

module.exports = new ValidationService();
