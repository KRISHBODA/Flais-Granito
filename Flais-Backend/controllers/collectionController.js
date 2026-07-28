const CollectionPage = require("../models/CollectionPage");
const { createSingletonPageController } = require("../utils/singletonPage");

const DEFAULT_COLLECTION = {
  bannerVideo: "",
  title: "Our Tile Collection",
  desc: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes.",
};

const { get: getCollectionPage, upsert: upsertCollectionPage } = createSingletonPageController({
  Model: CollectionPage,
  defaults: DEFAULT_COLLECTION,
  bodyKey: "collection",
  resourceKey: "collection",
  updateMessage: "Collection page settings updated",
});

exports.getCollectionPage = getCollectionPage;
exports.upsertCollectionPage = upsertCollectionPage;
