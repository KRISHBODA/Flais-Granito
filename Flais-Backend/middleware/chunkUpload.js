const multer = require("multer");

// Large-video chunk uploads are intentionally kept small so they never hit the
// request-size ceiling that broke the single multipart flow.
const uploadChunk = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

module.exports = uploadChunk;
