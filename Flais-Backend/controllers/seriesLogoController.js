const SeriesLogo = require("../models/SeriesLogo");
const uploadService = require("../services/storage/UploadService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all series logos
// @route   GET /api/series-logos
// @access  Public
exports.getSeriesLogos = asyncHandler(async (req, res) => {
  const logos = await SeriesLogo.find().sort({ order: 1, createdAt: 1 });
  sendSuccess(res, 200, { logos });
});

// @desc    Create a series logo
// @route   POST /api/series-logos
// @access  Private/Admin
exports.createSeriesLogo = asyncHandler(async (req, res) => {
  const { name, order } = req.body;
  let imageUrl = "";

  if (req.file) {
    const uploadResult = await uploadService.upload(req.file, "logos");
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    return sendError(res, 400, "Image is required");
  }

  if (!name) {
    return sendError(res, 400, "Name is required");
  }

  const logo = await SeriesLogo.create({
    name,
    image: imageUrl,
    order: order ? parseInt(order) : 0,
  });
  sendSuccess(res, 201, { message: "Series logo created", logo });
});

// @desc    Delete a series logo
// @route   DELETE /api/series-logos/:id
// @access  Private/Admin
exports.deleteSeriesLogo = asyncHandler(async (req, res) => {
  const logo = await SeriesLogo.findByIdAndDelete(req.params.id);
  if (!logo) {
    return sendError(res, 404, "Series logo not found");
  }

  if (logo.image) {
    await uploadService.delete(logo.image);
  }

  sendSuccess(res, 200, { message: "Series logo deleted" });
});

// @desc    Update a series logo
// @route   PUT /api/series-logos/:id
// @access  Private/Admin
exports.updateSeriesLogo = asyncHandler(async (req, res) => {
  const { name, order } = req.body;

  const logo = await SeriesLogo.findById(req.params.id);
  if (!logo) {
    return sendError(res, 404, "Series logo not found");
  }

  let updateData = { name, order: order ? parseInt(order) : undefined };

  if (req.file) {
    const uploadResult = await uploadService.replace(req.file, logo.image, "logos");
    updateData.image = uploadResult.url;
  }

  // Remove undefined values
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const updatedLogo = await SeriesLogo.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  sendSuccess(res, 200, { message: "Series logo updated", logo: updatedLogo });
});
