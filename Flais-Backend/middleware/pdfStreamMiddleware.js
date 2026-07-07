const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
  // Only handle GET and HEAD requests for PDF files
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  if (!req.path.toLowerCase().endsWith(".pdf")) {
    return next();
  }

  // Resolve the absolute file path inside the uploads directory
  const uploadsDir = path.resolve(__dirname, "../uploads");
  const filePath = path.join(uploadsDir, req.path);

  // Security: Prevent directory traversal attacks
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
  }

  // Check if file exists and get stats
  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).json({ success: false, message: "Catalog PDF not found" });
    }

    const fileSize = stats.size;
    const lastModified = stats.mtime.toUTCString();
    const etag = `W/"${fileSize}-${stats.mtime.getTime()}"`;

    // Set standard response headers for PDF caching and performance
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); // Cache for 1 year
    res.setHeader("Last-Modified", lastModified);
    res.setHeader("ETag", etag);

    // Support forced download vs inline viewing via query parameter
    if (req.query.download === "1" || req.query.download === "true") {
      const originalName = req.query.filename 
        ? encodeURIComponent(req.query.filename) 
        : path.basename(resolvedPath);
      res.setHeader("Content-Disposition", `attachment; filename="${originalName}"`);
    } else {
      res.setHeader("Content-Disposition", "inline");
    }

    // Handle Conditional GET requests (HTTP 304 Not Modified)
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    const ifModifiedSince = req.headers["if-modified-since"];
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
      return res.status(304).end();
    }

    // Handle Range Requests (HTTP 206 Partial Content)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range boundaries
      if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).end();
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", chunkSize);

      if (req.method === "HEAD") {
        return res.end();
      }

      const fileStream = fs.createReadStream(resolvedPath, { start, end });
      fileStream.on("error", (streamErr) => {
        console.error(`Error streaming range request for ${req.path}:`, streamErr);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      fileStream.pipe(res);
    } else {
      // Full content delivery (HTTP 200 OK)
      res.setHeader("Content-Length", fileSize);

      if (req.method === "HEAD") {
        return res.end();
      }

      const fileStream = fs.createReadStream(resolvedPath);
      fileStream.on("error", (streamErr) => {
        console.error(`Error streaming full request for ${req.path}:`, streamErr);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      fileStream.pipe(res);
    }
  });
};
