const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: { 
      type: String, 
      required: true 
    },
    image: { 
      type: String 
    },
    textColor: {
      type: String,
      default: "#ffffff"
    }
  }, 
  { 
    timestamps: true 
  }
);

blogSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
});

module.exports = mongoose.model("Blog", blogSchema);