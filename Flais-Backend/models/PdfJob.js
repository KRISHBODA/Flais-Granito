const mongoose = require("mongoose");

const pdfJobSchema = new mongoose.Schema(
  {
    catalogPageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogPage",
      required: true,
    },
    catalogItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    originalPdfPath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    processedPages: {
      type: Number,
      default: 0,
    },
    flipPath: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for worker polling: find pending jobs ordered by creation time
pdfJobSchema.index({ status: 1, createdAt: 1 });

// Look up jobs for a specific catalog entry
pdfJobSchema.index({ catalogItemId: 1 });

module.exports = mongoose.model("PdfJob", pdfJobSchema);
