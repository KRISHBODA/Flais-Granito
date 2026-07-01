const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCatalogPage, upsertCatalogPage } = require("../controllers/catalogController");

router.get("/", getCatalogPage);
router.put("/", protect, upsertCatalogPage);

module.exports = router;
