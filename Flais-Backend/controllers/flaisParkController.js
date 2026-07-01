const FlaisParkPage = require("../models/FlaisParkPage");

const DEFAULT_FLAIS_PARK = {
  pageSettings: {
    heroTitle: "Where to Buy",
    heroSubtitle: "Find our premium tiles at a showroom near you. Experience the quality and elegance of Sorona in person.",
    heroMedia: "",
    introTitle: "Step Into a World of Luxury and Grandeur",
    introDescription: "Explore our exclusive showrooms and authorized dealer network. Flais Park showcases our full collection of premium vitrified tiles in real-world layouts, giving you the inspiration to transform your architectural visions into reality."
  },
  dealers: []
};

exports.getFlaisParkPage = async (req, res) => {
  try {
    let flaisPark = await FlaisParkPage.findOne();
    if (!flaisPark) {
      flaisPark = await FlaisParkPage.create(DEFAULT_FLAIS_PARK);
    }
    res.status(200).json({ success: true, flaisPark });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertFlaisParkPage = async (req, res) => {
  try {
    const payload = req.body?.flaisPark ? req.body.flaisPark : req.body;

    const flaisPark = await FlaisParkPage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({ success: true, message: "Flais Park page details updated", flaisPark });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
