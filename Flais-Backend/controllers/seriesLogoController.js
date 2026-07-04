const SeriesLogo = require("../models/SeriesLogo");
const uploadService = require("../services/storage/UploadService");

// @desc    Get all series logos
// @route   GET /api/series-logos
// @access  Public
exports.getSeriesLogos = async (req, res) => {
  try {
    const logos = await SeriesLogo.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, logos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a series logo
// @route   POST /api/series-logos
// @access  Private/Admin
exports.createSeriesLogo = async (req, res) => {
  try {
    const { name, order } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploadResult = await uploadService.upload(req.file, "logos");
      imageUrl = uploadResult.url;
    }

    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const logo = await SeriesLogo.create({
      name,
      image: imageUrl,
      order: order ? parseInt(order) : 0,
    });
    res
      .status(201)
      .json({ success: true, message: "Series logo created", logo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a series logo
// @route   DELETE /api/series-logos/:id
// @access  Private/Admin
exports.deleteSeriesLogo = async (req, res) => {
  try {
    const logo = await SeriesLogo.findByIdAndDelete(req.params.id);
    if (!logo) {
      return res
        .status(404)
        .json({ success: false, message: "Series logo not found" });
    }
    
    if (logo.image) {
      await uploadService.delete(logo.image);
    }
    
    res.status(200).json({ success: true, message: "Series logo deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update a series logo
// @route   PUT /api/series-logos/:id
// @access  Private/Admin
exports.updateSeriesLogo = async (req, res) => {
  try {
    const { name, order } = req.body;
    
    const logo = await SeriesLogo.findById(req.params.id);
    if (!logo) {
      return res
        .status(404)
        .json({ success: false, message: "Series logo not found" });
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

    res
      .status(200)
      .json({ success: true, message: "Series logo updated", logo: updatedLogo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
