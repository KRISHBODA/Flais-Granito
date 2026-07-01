const mongoose = require("mongoose");

const homePageSchema = new mongoose.Schema(
  {
    homeTexts: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    choices: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    sizes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    categories: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    video: {
      url: { type: String, default: "" },
      name: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomePage", homePageSchema);
