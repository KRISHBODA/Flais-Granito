const multer = require("multer");

const MAX_FILE_SIZE_BYTES = parseInt(
  process.env.MAX_UPLOAD_SIZE_BYTES || String(500 * 1024 * 1024),
  10
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 30,
    fields: 100,
    fieldNameSize: 200,
  },
});

module.exports = upload;
