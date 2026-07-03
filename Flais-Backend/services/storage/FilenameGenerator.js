const crypto = require("crypto");

class FilenameGenerator {
  generate(originalName) {
    if (!originalName) {
      throw new Error("Cannot generate filename: Original name is empty");
    }

    const timestamp = Date.now();
    const uuid8 = crypto.randomUUID().split("-")[0]; // Get first 8 characters of UUID

    // Extract base name and extension
    const lastDotIndex = originalName.lastIndexOf(".");
    let baseName = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
    const ext = lastDotIndex !== -1 ? originalName.slice(lastDotIndex).toLowerCase() : "";

    // Sanitize base name: lowercase, replace special characters with dashes
    let sanitizedBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace all non-alphanumeric characters with -
      .replace(/-+/g, "-")        // Collapse multiple consecutive dashes
      .replace(/(^-|-$)/g, "");   // Trim leading/trailing dashes

    if (!sanitizedBase) {
      sanitizedBase = "file";
    }

    // Limit filename length to 120 characters (timestamp(13) + separator(1) + uuid8(8) + separator(1) + extension(approx 4) = 27 characters overhead)
    const maxBaseLength = 120 - 27;
    if (sanitizedBase.length > maxBaseLength) {
      sanitizedBase = sanitizedBase.slice(0, maxBaseLength).replace(/-$/, "");
    }

    return `${timestamp}-${uuid8}-${sanitizedBase}${ext}`;
  }
}

module.exports = new FilenameGenerator();
