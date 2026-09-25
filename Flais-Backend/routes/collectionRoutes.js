const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getCollectionPage, upsertCollectionPage } = require("../controllers/collectionController");

router.get("/", getCollectionPage);
router.put("/", protect, authorize("collection"), upsertCollectionPage);

module.exports = router;
