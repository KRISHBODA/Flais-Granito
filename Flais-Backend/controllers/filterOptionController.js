const FilterOption = require("../models/FilterOption");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Get all filter options
exports.getFilterOptions = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let query = {};
  if (type) {
    query.type = type;
  }
  const options = await FilterOption.find(query).sort({ createdAt: 1 });
  sendSuccess(res, 200, { options });
});

// Create a new filter option
exports.createFilterOption = asyncHandler(async (req, res) => {
  const { type, value, label } = req.body;
  if (!type || !value || !label) {
    return sendError(res, 400, "Type, value, and label are required");
  }

  const option = await FilterOption.create({ type, value, label });
  sendSuccess(res, 201, { message: "Filter option created successfully", option });
});

// Delete a filter option
exports.deleteFilterOption = asyncHandler(async (req, res) => {
  const option = await FilterOption.findByIdAndDelete(req.params.id);
  if (!option) {
    return sendError(res, 404, "Option not found");
  }
  sendSuccess(res, 200, { message: "Filter option deleted successfully" });
});

// Update a filter option
exports.updateFilterOption = asyncHandler(async (req, res) => {
  const { label, value } = req.body;
  const option = await FilterOption.findByIdAndUpdate(
    req.params.id,
    { label, value },
    { new: true, runValidators: true }
  );
  if (!option) {
    return sendError(res, 404, "Option not found");
  }
  sendSuccess(res, 200, { message: "Filter option updated successfully", option });
});
