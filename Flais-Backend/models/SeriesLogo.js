const mongoose = require("mongoose");

const seriesLogoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g. "LISC collection"
    },
    image: {
      type: String,
      required: true, // URL of the logo image
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeriesLogo", seriesLogoSchema);
