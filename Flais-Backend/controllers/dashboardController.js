const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Contact = require("../models/Contact");
const Category = require("../models/Category");
const CatalogPage = require("../models/CatalogPage");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts directly from MongoDB so the dashboard cards always reflect live data.
    const catalogPage = await CatalogPage.findOne();
    const activeCatalog = catalogPage?.catalogs?.length || 0;
    const totalBlogs = await Blog.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalEnquiries = await Contact.countDocuments();

    // Get recent data
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    const recentMessages = await Contact.find().sort({ createdAt: -1 }).limit(5);


    res.status(200).json({
      success: true,
      stats: {
        activeCatalog,
        totalProducts: activeCatalog,
        totalBlogs,
        totalCategories,
        totalEnquiries,
        totalMessages: totalEnquiries,
      },
      recentData: {
        recentProducts,
        recentBlogs,
        recentMessages,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
