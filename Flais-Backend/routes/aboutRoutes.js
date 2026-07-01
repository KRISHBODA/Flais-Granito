const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAboutPage, upsertAboutPage } = require("../controllers/aboutController");

router.get("/", getAboutPage);
router.put("/", protect, upsertAboutPage);

module.exports = router;
