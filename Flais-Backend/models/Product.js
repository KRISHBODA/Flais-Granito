const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: [String], // Array of image URLs
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    thickness: {
      type: String,
      default: '',
    },
    finishes: {
      type: String,
      default: '',
    },
    application: {
      type: String,
      default: '',
    },
    link360: {
      type: String,
      default: '',
    },
    randoms: {
      type: String,
      default: '',
    },
    productCollection: {
      type: String,
      default: '',
    },
    tagReview: {
      type: String,
      default: '',
    },
    has3dPreview: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique slug if not provided or modified
productSchema.pre("validate", async function () {
  if (this.title && (!this.slug || this.isModified("title") || this.isModified("slug"))) {
    let baseSlug = (this.slug || this.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    if (!baseSlug) baseSlug = "product";

    let candidateSlug = baseSlug;
    let counter = 1;
    while (
      await mongoose.models.Product.exists({
        slug: candidateSlug,
        _id: { $ne: this._id },
      })
    ) {
      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }
    this.slug = candidateSlug;
  }
});

module.exports = mongoose.model("Product", productSchema);