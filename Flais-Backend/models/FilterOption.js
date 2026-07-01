const mongoose = require("mongoose");

const filterOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["thickness", "size", "application"],
    },
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilterOption", filterOptionSchema);
