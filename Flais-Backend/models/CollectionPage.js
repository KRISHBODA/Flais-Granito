const mongoose = require("mongoose");

const collectionPageSchema = new mongoose.Schema(
  {
    bannerVideo: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "Our Tile Collection",
    },
    desc: {
      type: String,
      default: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollectionPage", collectionPageSchema);
