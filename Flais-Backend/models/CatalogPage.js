const mongoose = require("mongoose");

const catalogPageSchema = new mongoose.Schema(
  {
    pageSettings: {
      heroTitle: { type: String, default: "DOWNLOAD CATALOGS" },
      heroSubtitle: { type: String, default: "Explore and download our premium vitrified tiles collection brochures." },
      heroMedia: { type: String, default: "" }
    },
    catalogs: [
      {
        title: { type: String, required: true },
        image: { type: String, default: "" },
        link: { type: String, default: "" },
        flipPath: { type: String, default: "" },
        conversionStatus: {
          type: String,
          enum: ["none", "pending", "processing", "completed", "failed"],
          default: "none"
        },
        sequenceNumber: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("CatalogPage", catalogPageSchema);
