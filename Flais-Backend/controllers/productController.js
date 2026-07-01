const Product = require("../models/Product");

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { title, slug, description, price, category, stock, featured, size, color, thickness, finishes, application, link360 } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path); // Cloudinary URL is in path
    }

    const product = await Product.create({
      title,
      slug,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      featured: featured === "true" || featured === true,
      images: imageUrls,
      size,
      color,
      thickness,
      finishes,
      application,
      link360,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, search = "", category = "All" } = req.query;
    const limit = 12; 
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Single Product
// @route   GET /api/products/:id (also accepts slug)
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    // Check if it's a valid ObjectId, otherwise treat as slug
    let query = {};
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: idOrSlug };
    } else {
      query = { slug: idOrSlug };
    }

    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const { title, slug, description, price, category, stock, featured, size, color, thickness, finishes, application, link360 } = req.body;

    let updateData = {
      title,
      slug,
      description,
      price: price ? Number(price) : product.price,
      category,
      stock: stock !== undefined ? Number(stock) : product.stock,
      featured: featured !== undefined ? (featured === "true" || featured === true) : product.featured,
      size: size !== undefined ? size : product.size,
      color: color !== undefined ? color : product.color,
      thickness: thickness !== undefined ? thickness : product.thickness,
      finishes: finishes !== undefined ? finishes : product.finishes,
      application: application !== undefined ? application : product.application,
      link360: link360 !== undefined ? link360 : product.link360,
    };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      updateData.images = [...product.images, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

// @desc    Delete Product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};