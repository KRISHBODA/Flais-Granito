const Contact = require("../models/Contact");
const { validateEmail } = require("../services/emailValidation.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Create a contact message
// @route   POST /api/contact
// @access  Public
exports.createMessage = asyncHandler(async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const phone = (req.body.phone || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !phone || !message) {
    return sendError(res, 400, "Name, email, phone number, and message are required");
  }

  const phonePattern = /^\+[0-9-]+(?:\s+[0-9-]+)*$/;

  // Keep the country-code format that the frontend uses, including hyphenated country codes.
  if (!phonePattern.test(phone) || phone.replace(/\D/g, "").length < 7) {
    return sendError(
      res,
      400,
      "Phone number must include a valid country code starting with '+' (for example, +91 98765 43210)"
    );
  }

  // Validate email format + DNS MX records
  const emailResult = await validateEmail(email);
  if (!emailResult.valid) {
    return sendError(res, 400, emailResult.message || "Please enter a valid email address.");
  }

  const newContact = await Contact.create({
    name,
    email,
    phone,
    message,
  });

  sendSuccess(res, 201, { message: "Message sent successfully", contact: newContact });
});

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, { messages });
});

// @desc    Update message status (read/unread)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const isRead = typeof req.body.isRead === "boolean"
    ? req.body.isRead
    : req.body.status === "Read";

  const message = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead },
    { new: true }
  );

  if (!message) {
    return sendError(res, 404, "Message not found");
  }

  sendSuccess(res, 200, { message: "Message status updated", contact: message });
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndDelete(req.params.id);

  if (!message) {
    return sendError(res, 404, "Message not found");
  }

  sendSuccess(res, 200, { message: "Message deleted successfully" });
});
