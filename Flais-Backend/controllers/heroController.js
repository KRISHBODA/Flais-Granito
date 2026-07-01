const HeroSlide = require("../models/HeroSlide");

// @desc    Get all hero slides
// @route   GET /api/hero
// @access  Public
exports.getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a hero slide
// @route   POST /api/hero
// @access  Private/Admin
exports.createHeroSlide = async (req, res) => {
  try {
    const { tagline, title, subtitle } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL from Multer
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const slide = await HeroSlide.create({ tagline, title, subtitle, image: imageUrl });
    res.status(201).json({ success: true, message: "Slide created", slide });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a hero slide
// @route   DELETE /api/hero/:id
// @access  Private/Admin
exports.deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.status(200).json({ success: true, message: "Slide deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update a hero slide
// @route   PUT /api/hero/:id
// @access  Private/Admin
exports.updateHeroSlide = async (req, res) => {
  try {
    const { tagline, title, subtitle } = req.body;
    let updateData = { tagline, title, subtitle };

    if (req.file) {
      updateData.image = req.file.path; // New image
    }

    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    
    res.status(200).json({ success: true, message: "Slide updated", slide });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
