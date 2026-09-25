const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getCatalogPage, upsertCatalogPage, getCatalogJobStatus } = require("../controllers/catalogController");

router.get("/", getCatalogPage);
router.put("/", protect, authorize("catalog"), upsertCatalogPage);
router.get("/job-status/:catalogItemId", protect, authorize("catalog"), getCatalogJobStatus);

module.exports = router;
