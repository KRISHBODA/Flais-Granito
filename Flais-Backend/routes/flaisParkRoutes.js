const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getFlaisParkPage, upsertFlaisParkPage } = require("../controllers/flaisParkController");

router.get("/", getFlaisParkPage);
router.put("/", protect, upsertFlaisParkPage);

module.exports = router;
