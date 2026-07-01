const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { createRateLimit } = require("../middleware/rateLimit");

const contactLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many contact submissions. Please try again later.",
});

// Public Route
router.post("/", contactLimiter, createMessage);

// Protected Routes (Admin)
router.get("/", protect, getMessages);
router.put("/:id", protect, updateMessageStatus);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
