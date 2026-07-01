const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    tagline: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    image: {
      type: String,
      required: true, // This will store the Cloudinary image URL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
