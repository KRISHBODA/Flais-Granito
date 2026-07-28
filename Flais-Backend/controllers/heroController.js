const HeroSlide = require("../models/HeroSlide");
const uploadService = require("../services/storage/UploadService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all hero slides
// @route   GET /api/hero
// @access  Public
exports.getHeroSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find().sort({ createdAt: 1 });
  sendSuccess(res, 200, { slides });
});

// @desc    Create a hero slide
// @route   POST /api/hero
// @access  Private/Admin
exports.createHeroSlide = asyncHandler(async (req, res) => {
  const { tagline, title, subtitle } = req.body;
  let imageUrl = "";

  if (req.file) {
    const uploadResult = await uploadService.upload(req.file, "hero");
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    return sendError(res, 400, "Image is required");
  }

  const slide = await HeroSlide.create({ tagline, title, subtitle, image: imageUrl });
  sendSuccess(res, 201, { message: "Slide created", slide });
});

// @desc    Delete a hero slide
// @route   DELETE /api/hero/:id
// @access  Private/Admin
exports.deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByIdAndDelete(req.params.id);
  if (!slide) {
    return sendError(res, 404, "Slide not found");
  }

  if (slide.image) {
    await uploadService.delete(slide.image);
  }

  sendSuccess(res, 200, { message: "Slide deleted" });
});

// @desc    Update a hero slide
// @route   PUT /api/hero/:id
// @access  Private/Admin
exports.updateHeroSlide = asyncHandler(async (req, res) => {
  const { tagline, title, subtitle } = req.body;

  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) {
    return sendError(res, 404, "Slide not found");
  }

  let updateData = { tagline, title, subtitle };

  if (req.file) {
    const uploadResult = await uploadService.replace(req.file, slide.image, "hero");
    updateData.image = uploadResult.url;
  }

  const updatedSlide = await HeroSlide.findByIdAndUpdate(req.params.id, updateData, { new: true });

  sendSuccess(res, 200, { message: "Slide updated", slide: updatedSlide });
});
