const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCatalogPage, upsertCatalogPage, getCatalogJobStatus } = require("../controllers/catalogController");

router.get("/", getCatalogPage);
router.put("/", protect, upsertCatalogPage);
router.get("/job-status/:catalogItemId", protect, getCatalogJobStatus);

module.exports = router;
