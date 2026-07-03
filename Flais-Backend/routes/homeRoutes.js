const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { getHomePage, upsertHomePage } = require("../controllers/homeController");

router.get("/", getHomePage);
router.put("/", protect, upload.single("video"), upsertHomePage);

module.exports = router;
