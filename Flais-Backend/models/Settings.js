const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  phone: { type: String, default: "+91 9909911772" },
  phone1: { type: String, default: "+91 95867 33300" },
  phone2: { type: String, default: "+91 98983 04831" },
  email: { type: String, default: "info@flaisgranito.com" },
  address: { type: String, default: "Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India." },
  heroTitle: { type: String, default: "Contact Us" },
  heroSubtitle: { type: String, default: "Have a question or planning a project? Reach out to our team of experts today." },
  heroMedia: { type: String, default: "" },
  facebook: { type: String, default: "https://www.facebook.com/share/1Eqo7HDYNb/" },
  instagram: { type: String, default: "https://www.instagram.com/flais_tiles.and.adhesives/?hl=en" },
  linkedin: { type: String, default: "https://www.linkedin.com/company/flais-granito" },
  youtube: { type: String, default: "https://www.youtube.com/@flais_tiles.and.adhesives" },
  pinterest: { type: String, default: "https://pin.it/3NKlK8ujW" }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
