const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { videoUploadR2 } = require("../middleware/r2Upload");
const { getHomePage, upsertHomePage } = require("../controllers/homeController");

router.get("/", getHomePage);
router.put("/", protect, videoUploadR2.single("video"), upsertHomePage);

module.exports = router;
