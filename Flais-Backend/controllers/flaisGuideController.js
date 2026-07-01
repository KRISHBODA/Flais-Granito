const FlaisGuidePage = require("../models/FlaisGuidePage");

const DEFAULT_FLAIS_GUIDE = {
  achievementsSettings: {
    heroTitle: "Achievements",
    heroSubtitle: "Our journey of excellence, global presence, and certification standards.",
    heroMedia: "",
    introTitle: "Pioneering the Future of Surfaces",
    introDescription: "FLAIS GRANITO is committed to delivering world-class surface solutions. Our state-of-the-art manufacturing processes are backed by international quality certifications, sustainable guidelines, and globally recognized achievements."
  },
  exhibitions: [],
  certifications: [],
  verificationDocs: [],
  awardsSettings: {
    badge: "Awards & Achievements",
    title: "Accolades of\nInnovation & Excellence",
    desc: "Our awards gallery is a testament to the dedication, hard work, and industry-leading standards we maintain across our manufacturing processes and design achievements. From national exporter recognitions to design excellence certificates, each milestone represents our promise of delivering premium surfaces.",
    stat1Val: "50+",
    stat1Label: "Industrial Awards",
    stat2Val: "Global",
    stat2Label: "Design Standard",
    image: ""
  },
  exhibitionVideo: "",
  technicalGuide: {
    title: "Technical Guide",
    subtitle: "In-depth technical specifications for architects and engineers.",
    pdfUrl: "",
    whatsIncluded: [
      "Detailed specifications and standards",
      "Quality assurance documentation",
      "Expert recommendations and best practices"
    ]
  },
  installationGuide: {
    title: "Process for Flais Granito",
    subtitle: "Installation Guide",
    heroImage: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?q=80&w=2070&auto=format&fit=crop",
    pdfUrl: "",
    steps: []
  },
  tileCalculator: {
    badge: "Advanced Planning Tool",
    title: "Tile Calculator",
    subtitle: "Calculate exact materials for multiple rooms, preview layouts, and generate branded PDF estimates.",
    tileSizes: [
      { id: "600x600", w: 600, h: 600, label: "600×600 mm", desc: "LISC / MARVEL", count: 4 },
      { id: "600x1200", w: 600, h: 1200, label: "600×1200 mm", desc: "GLASS / ELECTRA", count: 2 },
      { id: "800x1600", w: 800, h: 1600, label: "800×1600 mm", desc: "MARBLE GLOSS", count: 2 },
      { id: "800x2400", w: 800, h: 2400, label: "800×2400 mm", desc: "EXTRA MAX", count: 2 },
      { id: "800x3000", w: 800, h: 3000, label: "800×3000 mm", desc: "EXTRA MAX XL", count: 1 },
      { id: "custom", label: "Custom", desc: "Enter dimensions", count: 0 }
    ],
    patterns: [
      { id: "straight", label: "Straight Lay", wastage: 5, desc: "Grid pattern" },
      { id: "brick", label: "Brick Offset", wastage: 10, desc: "Staggered rows" },
      { id: "herringbone", label: "Herringbone", wastage: 15, desc: "Classic V-pattern" },
      { id: "diagonal", label: "Diagonal 45°", wastage: 20, desc: "Rotated grid" },
      { id: "double-herringbone", label: "Double Herringbone", wastage: 20, desc: "Mirrored V-pattern" }
    ],
    groutOptions: [
      { value: 2, label: "2mm", factor: 1 },
      { value: 3, label: "3mm", factor: 1.4 },
      { value: 5, label: "5mm", factor: 2.2 }
    ]
  }
};

exports.getFlaisGuidePage = async (req, res) => {
  try {
    let flaisGuide = await FlaisGuidePage.findOne();
    if (!flaisGuide) {
      flaisGuide = await FlaisGuidePage.create(DEFAULT_FLAIS_GUIDE);
    } else {
      // Migrate existing sizes that do not have count field
      let updated = false;
      if (flaisGuide.tileCalculator && flaisGuide.tileCalculator.tileSizes) {
        flaisGuide.tileCalculator.tileSizes = flaisGuide.tileCalculator.tileSizes.map(size => {
          if (size.id !== 'custom' && (size.count === undefined || size.count === null || size.count === 0)) {
            let defaultCount = 4;
            if (size.w && size.h) {
              const area = (size.w * size.h) / 1000000;
              if (area <= 0.4) {
                defaultCount = 4;
              } else if (area <= 1.44) {
                defaultCount = 2;
              } else {
                defaultCount = 1;
              }
            }
            size.count = defaultCount;
            updated = true;
          }
          return size;
        });
      }
      if (updated) {
        flaisGuide.markModified('tileCalculator');
        await flaisGuide.save();
      }
    }
    res.status(200).json({ success: true, flaisGuide });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertFlaisGuidePage = async (req, res) => {
  try {
    const payload = req.body?.flaisGuide ? req.body.flaisGuide : req.body;
    const flaisGuide = await FlaisGuidePage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json({ success: true, message: "Flais Guide page details updated", flaisGuide });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
