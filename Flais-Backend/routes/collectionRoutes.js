const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCollectionPage, upsertCollectionPage } = require("../controllers/collectionController");

router.get("/", getCollectionPage);
router.put("/", protect, upsertCollectionPage);

module.exports = router;
