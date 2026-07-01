const CollectionPage = require("../models/CollectionPage");

const DEFAULT_COLLECTION = {
  bannerVideo: "",
  title: "Our Tile Collection",
  desc: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes.",
};

exports.getCollectionPage = async (req, res) => {
  try {
    let collection = await CollectionPage.findOne();
    if (!collection) {
      collection = await CollectionPage.create(DEFAULT_COLLECTION);
    }
    res.status(200).json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.upsertCollectionPage = async (req, res) => {
  try {
    const payload = req.body?.collection ? req.body.collection : req.body;
    const collection = await CollectionPage.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json({ success: true, message: "Collection page settings updated", collection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
