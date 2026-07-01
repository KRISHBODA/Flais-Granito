const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "flais-granito",
    resource_type: "auto",
    public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB — supports large video uploads (brand films)
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-m4v",
    ];

    if (allowed.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

module.exports = upload;
