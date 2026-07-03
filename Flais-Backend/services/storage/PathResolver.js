class PathResolver {
  buildPath(mimetype, category, subcategory, filename) {
    let typeDir = "general";
    let useDatePartition = false;

    // 1. Determine base media type directory
    if (mimetype.startsWith("image/")) {
      typeDir = "images";
      useDatePartition = true; // Image types default to date partitioning
    } else if (mimetype.startsWith("video/")) {
      typeDir = "videos";
    } else if (mimetype === "application/pdf") {
      typeDir = "pdfs";
    }

    // 2. Resolve target category directory
    const targetCategory = (category || "general").toLowerCase();

    // Disable date partitioning for specific categories to keep them flat (e.g. logos)
    if (targetCategory === "logos" || targetCategory === "categories") {
      useDatePartition = false;
    }

    // 3. Construct relative folder structure
    let folder = `${typeDir}/${targetCategory}`;

    if (subcategory) {
      const cleanSub = subcategory.toLowerCase().replace(/[^a-z0-9]/g, "-");
      folder = `${folder}/${cleanSub}`;
    }

    if (useDatePartition) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      folder = `${folder}/${year}-${month}`;
    }

    return `${folder}/${filename}`;
  }
}

module.exports = new PathResolver();
