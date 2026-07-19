const Product = require("../models/Product");
const uploadService = require("../services/storage/UploadService");

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { title, slug, description, price, category, stock, featured, size, color, thickness, finishes, application, link360, randoms, collection: productCollection, tagReview } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadService.upload(file, "products");
        imageUrls.push(uploadResult.path);
      }
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
      randoms,
      productCollection,
      tagReview,
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
    const { page = 1, search = "", category = "All", limit: queryLimit } = req.query;
    
    let limit = 12;
    let skip = (page - 1) * limit;
    
    if (queryLimit) {
      if (queryLimit === "all") {
        limit = 0;
      } else {
        limit = Number(queryLimit);
        skip = (page - 1) * limit;
      }
    }

    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    const totalProducts = await Product.countDocuments(query);
    
    let dbQuery = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      dbQuery = dbQuery.limit(limit).skip(skip);
    }
    const products = await dbQuery;

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get Single Product
// @route   GET /api/products/:id (also accepts slug)
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
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

    const { title, slug, description, price, category, stock, featured, size, color, thickness, finishes, application, link360, randoms, collection: productCollection, tagReview } = req.body;

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
      randoms: randoms !== undefined ? randoms : product.randoms,
      productCollection: productCollection !== undefined ? productCollection : product.productCollection,
      tagReview: tagReview !== undefined ? tagReview : product.tagReview,
    };

    let remainingImages = [];
    if (req.body.existingImages) {
      try {
        remainingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        remainingImages = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      }
    } else {
      if ('existingImages' in req.body) {
        remainingImages = [];
      } else {
        remainingImages = product.images || [];
      }
    }

    // Delete physically removed images from disk
    const deletedImages = (product.images || []).filter(img => !remainingImages.includes(img));
    for (const imgPath of deletedImages) {
      await uploadService.delete(imgPath);
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadService.upload(file, "products");
        newImages.push(uploadResult.path);
      }
    }
    updateData.images = [...remainingImages, ...newImages];

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

    // Clean up local images
    if (product.images && product.images.length > 0) {
      for (const imagePath of product.images) {
        await uploadService.delete(imagePath);
      }
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