const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Create a Category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  // Check if category exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return sendError(res, 400, "Category already exists");
  }

  const category = await Category.create({ name, slug });
  sendSuccess(res, 201, { message: "Category created successfully", category });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  sendSuccess(res, 200, { categories });
});

// @desc    Update a Category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true, runValidators: true }
  );

  if (!category) {
    return sendError(res, 404, "Category not found");
  }

  sendSuccess(res, 200, { message: "Category updated successfully", category });
});

// @desc    Delete a Category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return sendError(res, 404, "Category not found");
  }

  sendSuccess(res, 200, { message: "Category deleted successfully" });
});
