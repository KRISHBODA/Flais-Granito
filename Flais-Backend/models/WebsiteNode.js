const mongoose = require("mongoose");

const websiteNodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["folder", "file"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebsiteNode",
      default: null,
    },
    relativePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    extension: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that within the same parent folder, the slug is unique.
// MongoDB treats `null` as a distinct value, so root level nodes (parentId = null)
// will also be checked for uniqueness.
websiteNodeSchema.index({ parentId: 1, slug: 1 }, { unique: true });

// Auto-generate slug if not provided (fallback)
websiteNodeSchema.pre("validate", function () {
  if (this.name && !this.slug) {
    // Basic sanitization, preserving dots for extensions
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

module.exports = mongoose.model("WebsiteNode", websiteNodeSchema);
