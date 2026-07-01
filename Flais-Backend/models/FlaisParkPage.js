const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  coordinates: { type: String, default: "" },
  type: { type: String, default: "Exclusive Showroom" }
});

const flaisParkPageSchema = new mongoose.Schema(
  {
    pageSettings: {
      heroTitle: { type: String, default: "Where to Buy" },
      heroSubtitle: { type: String, default: "Find our premium tiles at a showroom near you. Experience the quality and elegance of Sorona in person." },
      heroMedia: { type: String, default: "" },
      introTitle: { type: String, default: "Step Into a World of Luxury and Grandeur" },
      introDescription: { type: String, default: "Explore our exclusive showrooms and authorized dealer network. Flais Park showcases our full collection of premium vitrified tiles in real-world layouts, giving you the inspiration to transform your architectural visions into reality." }
    },
    dealers: [dealerSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlaisParkPage", flaisParkPageSchema);
