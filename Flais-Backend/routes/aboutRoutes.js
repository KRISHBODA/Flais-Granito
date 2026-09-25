const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getAboutPage, upsertAboutPage } = require("../controllers/aboutController");

router.get("/", getAboutPage);
router.put("/", protect, authorize("why-flais"), upsertAboutPage);

module.exports = router;
