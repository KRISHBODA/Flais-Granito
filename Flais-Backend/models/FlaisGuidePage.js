const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  location: { type: String, required: true },
  year: { type: String, required: true },
  description: { type: String, default: "" }
});

const certificationSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  icon: { type: String, default: "ShieldCheck" },
  details: { type: String, default: "" }
});

const verificationDocSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  desc: { type: String, default: "" },
  image: { type: String, default: "" }
});

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, default: "Ruler" },
  content: { type: String, default: "" }
});

const tileSizeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  w: { type: Number },
  h: { type: Number },
  label: { type: String, required: true },
  desc: { type: String, default: "" },
  count: { type: Number, default: 0 }
});

const patternSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  wastage: { type: Number, required: true },
  desc: { type: String, default: "" }
});

const groutOptionSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true },
  factor: { type: Number, required: true }
});

const flaisGuidePageSchema = new mongoose.Schema(
  {
    achievementsSettings: {
      heroTitle: { type: String, default: "Achievements" },
      heroSubtitle: { type: String, default: "Our journey of excellence, global presence, and certification standards." },
      heroMedia: { type: String, default: "" },
      introTitle: { type: String, default: "Pioneering the Future of Surfaces" },
      introDescription: { type: String, default: "FLAIS GRANITO is committed to delivering world-class surface solutions. Our state-of-the-art manufacturing processes are backed by international quality certifications, sustainable guidelines, and globally recognized achievements." }
    },
    exhibitions: [exhibitionSchema],
    certifications: [certificationSchema],
    verificationDocs: [verificationDocSchema],
    awardsSettings: {
      badge: { type: String, default: "Awards & Achievements" },
      title: { type: String, default: "Accolades of\nInnovation & Excellence" },
      desc: { type: String, default: "Our awards gallery is a testament to the dedication, hard work, and industry-leading standards we maintain across our manufacturing processes and design achievements. From national exporter recognitions to design excellence certificates, each milestone represents our promise of delivering premium surfaces." },
      stat1Val: { type: String, default: "50+" },
      stat1Label: { type: String, default: "Industrial Awards" },
      stat2Val: { type: String, default: "Global" },
      stat2Label: { type: String, default: "Design Standard" },
      image: { type: String, default: "" }
    },
    exhibitionVideo: { type: String, default: "" },
    technicalGuide: {
      title: { type: String, default: "Technical Guide" },
      subtitle: { type: String, default: "In-depth technical specifications for architects and engineers." },
      pdfUrl: { type: String, default: "" },
      whatsIncluded: [{ type: String }]
    },
    installationGuide: {
      title: { type: String, default: "Process for Flais Granito" },
      subtitle: { type: String, default: "Installation Guide" },
      heroImage: { type: String, default: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?q=80&w=2070&auto=format&fit=crop" },
      pdfUrl: { type: String, default: "" },
      steps: [stepSchema]
    },
    tileCalculator: {
      badge: { type: String, default: "Advanced Planning Tool" },
      title: { type: String, default: "Tile Calculator" },
      subtitle: { type: String, default: "Calculate exact materials for multiple rooms, preview layouts, and generate branded PDF estimates." },
      tileSizes: [tileSizeSchema],
      patterns: [patternSchema],
      groutOptions: [groutOptionSchema]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlaisGuidePage", flaisGuidePageSchema);
