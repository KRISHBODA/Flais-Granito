const mongoose = require("mongoose");

const aboutPageSchema = new mongoose.Schema(
  {
    aboutSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    videos: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pillars: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    exportCountries: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);
