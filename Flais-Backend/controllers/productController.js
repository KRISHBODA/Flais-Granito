const Product = require("../models/Product");
const uploadService = require("../services/storage/UploadService");

const MAX_PAGE_SIZE = 1000;
const MAX_SEARCH_LENGTH = 100;
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    const { search = "", category = "All", limit: queryLimit } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);

    let limit = 12;
    if (queryLimit) {
      const parsedLimit = queryLimit === "all" ? MAX_PAGE_SIZE : Number(queryLimit);
      limit = Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.floor(parsedLimit), MAX_PAGE_SIZE)
        : 12;
    }
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const term = String(search).slice(0, MAX_SEARCH_LENGTH);
      query.title = { $regex: escapeRegExp(term), $options: "i" };
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

// @desc    Scan / lookup product by code, slug, id, or title
// @route   GET /api/products/scan/:code
// @access  Public
exports.scanProduct = async (req, res) => {
  try {
    let rawCode = (req.params.code || "").trim();
    if (!rawCode) {
      return res.status(400).json({ success: false, message: "Product code is required" });
    }

    try {
      rawCode = decodeURIComponent(rawCode);
    } catch (e) {
      // ignore decode error
    }

    // If rawCode is a full URL or path containing /products/:slug
    let code = rawCode;
    const urlMatch = rawCode.match(/\/products\/([^/?#]+)/i);
    if (urlMatch && urlMatch[1]) {
      code = urlMatch[1].trim();
    }

    // Strip common brand prefixes (e.g. FG-, fg-, FLAIS-)
    const cleanPrefixCode = code.replace(/^(?:FG|fg|FLAIS|flais)[\s-_:]*/i, "").trim();

    // 1. Check if 24-hex ObjectId
    if (code.match(/^[0-9a-fA-F]{24}$/)) {
      const byId = await Product.findById(code);
      if (byId) return res.status(200).json({ success: true, product: byId });
    }

    // 2. Exact slug match
    const slugCandidates = [code.toLowerCase(), cleanPrefixCode.toLowerCase()];
    for (const s of slugCandidates) {
      if (!s) continue;
      const bySlug = await Product.findOne({ slug: s });
      if (bySlug) return res.status(200).json({ success: true, product: bySlug });
    }

    // 3. Exact title match (case-insensitive)
    const titleCandidates = [code, cleanPrefixCode];
    for (const t of titleCandidates) {
      if (!t) continue;
      const byTitle = await Product.findOne({
        title: { $regex: `^${escapeRegExp(t)}$`, $options: "i" },
      });
      if (byTitle) return res.status(200).json({ success: true, product: byTitle });
    }

    // 4. Fuzzy / substring match across title and slug
    const searchTerm = cleanPrefixCode || code;
    if (searchTerm.length >= 2) {
      const fuzzyProduct = await Product.findOne({
        $or: [
          { title: { $regex: escapeRegExp(searchTerm), $options: "i" } },
          { slug: { $regex: escapeRegExp(searchTerm.toLowerCase().replace(/\s+/g, "-")), $options: "i" } },
        ],
      });

      if (fuzzyProduct) {
        return res.status(200).json({ success: true, product: fuzzyProduct });
      }
    }

    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};