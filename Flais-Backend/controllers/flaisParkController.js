const FlaisParkPage = require("../models/FlaisParkPage");
const { createSingletonPageController } = require("../utils/singletonPage");

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

const { get: getFlaisParkPage, upsert: upsertFlaisParkPage } = createSingletonPageController({
  Model: FlaisParkPage,
  defaults: DEFAULT_FLAIS_PARK,
  bodyKey: "flaisPark",
  resourceKey: "flaisPark",
  updateMessage: "Flais Park page details updated",
});

exports.getFlaisParkPage = getFlaisParkPage;
exports.upsertFlaisParkPage = upsertFlaisParkPage;
