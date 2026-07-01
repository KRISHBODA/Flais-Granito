const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2Client = require("../config/r2");

// Use memory storage to get file buffer
const storage = multer.memoryStorage();

const videoUploadR2 = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-m4v",
    ];

    if (allowedVideoTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error(`Unsupported video type: ${file.mimetype}`));
  },
});

/**
 * Upload file to Cloudflare R2
 * @param {File} file - Multer file object
 * @param {String} folder - R2 bucket folder path
 * @returns {Promise<String>} Public URL of uploaded file
 */
async function uploadToR2(file, folder = "videos") {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Generate safe filename
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9_-]/g, "_"); // Replace special chars

    const timestamp = Date.now();
    const extension = file.originalname.split(".").pop();
    const key = `${folder}/${timestamp}-${safeName}.${extension}`;

    // Upload to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // Generate public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;


    return {
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete file from R2
 * @param {String} key - R2 object key
 */
async function deleteFromR2(key) {
  try {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await r2Client.send(command);

    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Upload image to R2
 * @param {File} file - Multer file object
 * @param {String} folder - R2 bucket folder path
 * @returns {Promise<String>} Public URL of uploaded file
 */
async function uploadImageToR2(file, folder = "images") {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported image type: ${file.mimetype}`);
    }

    const safeName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const timestamp = Date.now();
    const extension = file.originalname.split(".").pop();
    const key = `${folder}/${timestamp}-${safeName}.${extension}`;

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;


    return {
      success: true,
      url: publicUrl,
      key: key,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  videoUploadR2,
  uploadToR2,
  deleteFromR2,
  uploadImageToR2,
};
