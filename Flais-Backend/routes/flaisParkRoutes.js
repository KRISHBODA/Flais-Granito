const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getFlaisParkPage, upsertFlaisParkPage } = require("../controllers/flaisParkController");

router.get("/", getFlaisParkPage);
router.put("/", protect, authorize("flais-park"), upsertFlaisParkPage);

module.exports = router;
