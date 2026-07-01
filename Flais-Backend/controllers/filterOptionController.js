const FilterOption = require("../models/FilterOption");

// Get all filter options
exports.getFilterOptions = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) {
      query.type = type;
    }
    const options = await FilterOption.find(query).sort({ createdAt: 1 });
    res.status(200).json({ success: true, options });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// Create a new filter option
exports.createFilterOption = async (req, res) => {
  try {
    const { type, value, label } = req.body;
    if (!type || !value || !label) {
      return res.status(400).json({ success: false, message: "Type, value, and label are required" });
    }

    const option = await FilterOption.create({ type, value, label });
    res.status(201).json({ success: true, message: "Filter option created successfully", option });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// Delete a filter option
exports.deleteFilterOption = async (req, res) => {
  try {
    const option = await FilterOption.findByIdAndDelete(req.params.id);
    if (!option) {
      return res.status(404).json({ success: false, message: "Option not found" });
    }
    res.status(200).json({ success: true, message: "Filter option deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// Update a filter option
exports.updateFilterOption = async (req, res) => {
  try {
    const { label, value } = req.body;
    const option = await FilterOption.findByIdAndUpdate(
      req.params.id,
      { label, value },
      { new: true, runValidators: true }
    );
    if (!option) {
      return res.status(404).json({ success: false, message: "Option not found" });
    }
    res.status(200).json({ success: true, message: "Filter option updated successfully", option });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
