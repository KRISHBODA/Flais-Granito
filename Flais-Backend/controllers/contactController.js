const Contact = require("../models/Contact");
const { validateEmail } = require("../services/emailValidation.service");

// @desc    Create a contact message
// @route   POST /api/contact
// @access  Public
exports.createMessage = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const phone = (req.body.phone || "").trim();
    const message = (req.body.message || "").trim();

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone number, and message are required"
      });
    }

    const phonePattern = /^\+[0-9-]+(?:\s+[0-9-]+)*$/;

    // Keep the country-code format that the frontend uses, including hyphenated country codes.
    if (!phonePattern.test(phone) || phone.replace(/\D/g, "").length < 7) {
      return res.status(400).json({
        success: false,
        message: "Phone number must include a valid country code starting with '+' (for example, +91 98765 43210)"
      });
    }

    // Validate email format + DNS MX records
    const emailResult = await validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({
        success: false,
        message: emailResult.message || "Please enter a valid email address."
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({ success: true, message: "Message sent successfully", contact: newContact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update message status (read/unread)
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
  try {
    const isRead = typeof req.body.isRead === "boolean"
      ? req.body.isRead
      : req.body.status === "Read";
    
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, message: "Message status updated", contact: message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
