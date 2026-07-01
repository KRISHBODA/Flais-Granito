const CatalogPage = require("../models/CatalogPage");

const DEFAULT_CATALOG = {
  pageSettings: {
    heroTitle: "DOWNLOAD CATALOGS",
    heroSubtitle: "Explore and download our premium vitrified tiles collection brochures.",
    heroMedia: ""
  },
  catalogs: []
};

exports.getCatalogPage = async (req, res) => {
  try {
    let catalog = await CatalogPage.findOne();
    if (!catalog) {
      catalog = await CatalogPage.create(DEFAULT_CATALOG);
    }
    res.status(200).json({ success: true, catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertCatalogPage = async (req, res) => {
  try {
    const payload = req.body?.catalog ? req.body.catalog : req.body;
    const catalog = await CatalogPage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json({ success: true, message: "Catalog page settings updated", catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
