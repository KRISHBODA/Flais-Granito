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

    let previewImageUrls = [];
    let jpgImageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadService.upload(file, "products");
        if (
          file.fieldname === "previewImages" ||
          file.fieldname === "previewImage" ||
          file.fieldname === "preview3d"
        ) {
          previewImageUrls.push(uploadResult.path);
        } else {
          jpgImageUrls.push(uploadResult.path);
        }
      }
    }

    // 3D Preview ALWAYS goes first (#1 photo on collection page), followed by JPG simple tile photos
    const imageUrls = [...previewImageUrls, ...jpgImageUrls];

    let is3d = previewImageUrls.length > 0;
    if (req.body.has3dPreview !== undefined) {
      is3d = req.body.has3dPreview === "true" || req.body.has3dPreview === true;
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
      has3dPreview: is3d,
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
    const { 
      search = "", 
      category = "All", 
      limit: queryLimit,
      filter360 = "all",
      filter3d = "all",
      filterTag = "all",
      size = "All"
    } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);

    let limit = 12;
    if (queryLimit) {
      const parsedLimit = queryLimit === "all" ? MAX_PAGE_SIZE : Number(queryLimit);
      limit = Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.floor(parsedLimit), MAX_PAGE_SIZE)
        : 12;
    }
    const skip = (page - 1) * limit;

    const andConditions = [];

    if (search) {
      const term = String(search).slice(0, MAX_SEARCH_LENGTH);
      andConditions.push({ title: { $regex: escapeRegExp(term), $options: "i" } });
    }

    if (category && category !== "All" && category !== "All Categories") {
      andConditions.push({ category });
    }

    // Size filter
    if (size && size !== "All" && size !== "all") {
      andConditions.push({
        size: { $regex: new RegExp(`^${escapeRegExp(String(size).trim())}$`, "i") }
      });
    }

    // 360 Link filter: uploaded vs missing
    if (filter360 === "uploaded" || filter360 === "true") {
      andConditions.push({
        link360: { $exists: true, $nin: ["", null, "null", "undefined"] }
      });
    } else if (filter360 === "missing" || filter360 === "false") {
      andConditions.push({
        $or: [
          { link360: { $exists: false } },
          { link360: { $in: ["", null, "null", "undefined"] } }
        ]
      });
    }

    // 3D Preview (#1 photo on collection page): uploaded vs missing
    if (filter3d === "uploaded" || filter3d === "true") {
      andConditions.push({
        has3dPreview: { $ne: false },
        "images.0": { $exists: true, $nin: ["", null] }
      });
    } else if (filter3d === "missing" || filter3d === "false") {
      andConditions.push({
        $or: [
          { has3dPreview: false },
          { images: { $exists: false } },
          { images: { $size: 0 } },
          { "images.0": { $in: ["", null] } }
        ]
      });
    }

    // Tag/Review filter: uploaded/has vs missing vs Best Selling vs New Arrival vs specific tag
    if (filterTag && filterTag !== "all") {
      const normalizedTag = String(filterTag).trim().toLowerCase();
      if (normalizedTag === "uploaded" || normalizedTag === "has" || normalizedTag === "true") {
        andConditions.push({
          tagReview: { $exists: true, $nin: ["", null, "null", "undefined"] }
        });
      } else if (normalizedTag === "missing" || normalizedTag === "false") {
        andConditions.push({
          $or: [
            { tagReview: { $exists: false } },
            { tagReview: { $in: ["", null, "null", "undefined"] } }
          ]
        });
      } else if (normalizedTag === "best selling" || normalizedTag === "best-selling" || normalizedTag === "best_selling" || normalizedTag === "bestselling") {
        andConditions.push({
          tagReview: { $regex: /best\s*selling/i }
        });
      } else if (normalizedTag === "new arrival" || normalizedTag === "new-arrival" || normalizedTag === "new_arrival" || normalizedTag === "newarrival") {
        andConditions.push({
          tagReview: { $regex: /new\s*arrival/i }
        });
      } else {
        andConditions.push({
          tagReview: { $regex: `^${escapeRegExp(String(filterTag).trim())}$`, $options: "i" }
        });
      }
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const [
      totalProducts, 
      total360Uploaded, 
      total3dUploaded, 
      totalTagUploaded, 
      bestSellingCount,
      newArrivalCount,
      distinctTags, 
      totalAll,
      distinctSizes,
      sizeAgg
    ] = await Promise.all([
      Product.countDocuments(query),
      Product.countDocuments({ link360: { $exists: true, $nin: ["", null, "null", "undefined"] } }),
      Product.countDocuments({ has3dPreview: { $ne: false }, "images.0": { $exists: true, $nin: ["", null] } }),
      Product.countDocuments({ tagReview: { $exists: true, $nin: ["", null, "null", "undefined"] } }),
      Product.countDocuments({ tagReview: { $regex: /best\s*selling/i } }),
      Product.countDocuments({ tagReview: { $regex: /new\s*arrival/i } }),
      Product.distinct("tagReview", { tagReview: { $exists: true, $nin: ["", null, "null", "undefined"] } }),
      Product.countDocuments({}),
      Product.distinct("size", { size: { $exists: true, $nin: ["", null] } }),
      Product.aggregate([
        { $match: { size: { $exists: true, $nin: ["", null] } } },
        { $group: { _id: "$size", count: { $sum: 1 } } }
      ])
    ]);

    const sizeCounts = (sizeAgg || []).reduce((acc, item) => {
      if (item._id) acc[item._id] = item.count;
      return acc;
    }, {});
    
    let dbQuery = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      dbQuery = dbQuery.limit(limit).skip(skip);
    }
    const products = await dbQuery;

    const mediaStats = {
      total: totalAll,
      has360Count: total360Uploaded,
      missing360Count: Math.max(0, totalAll - total360Uploaded),
      has3dCount: total3dUploaded,
      missing3dCount: Math.max(0, totalAll - total3dUploaded),
      hasTagCount: totalTagUploaded,
      missingTagCount: Math.max(0, totalAll - totalTagUploaded),
      bestSellingCount,
      newArrivalCount,
      distinctTags: (distinctTags || []).filter(Boolean),
      distinctSizes: (distinctSizes || []).filter(Boolean).sort(),
      sizeCounts,
    };

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
      currentPage: Number(page),
      mediaStats,
      sizes: (distinctSizes || []).filter(Boolean).sort(),
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

    let existingPreviewImages = [];
    let existingJpgImages = [];

    if (req.body.existingPreviewImages !== undefined) {
      try {
        existingPreviewImages = JSON.parse(req.body.existingPreviewImages);
      } catch (e) {
        existingPreviewImages = Array.isArray(req.body.existingPreviewImages)
          ? req.body.existingPreviewImages
          : (req.body.existingPreviewImages ? [req.body.existingPreviewImages] : []);
      }
    }

    if (req.body.existingJpgImages !== undefined) {
      try {
        existingJpgImages = JSON.parse(req.body.existingJpgImages);
      } catch (e) {
        existingJpgImages = Array.isArray(req.body.existingJpgImages)
          ? req.body.existingJpgImages
          : (req.body.existingJpgImages ? [req.body.existingJpgImages] : []);
      }
    }

    let remainingImages = [];
    const hasSplitFields = req.body.existingPreviewImages !== undefined || req.body.existingJpgImages !== undefined;

    if (hasSplitFields) {
      remainingImages = [...existingPreviewImages, ...existingJpgImages];
    } else if (req.body.existingImages) {
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

    let uploadedPreviewUrls = [];
    let uploadedJpgUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadService.upload(file, "products");
        if (
          file.fieldname === "previewImages" ||
          file.fieldname === "previewImage" ||
          file.fieldname === "preview3d"
        ) {
          uploadedPreviewUrls.push(uploadResult.path);
        } else {
          uploadedJpgUrls.push(uploadResult.path);
        }
      }
    }

    // 3D Preview ALWAYS goes first (#1 photo), followed by JPG simple tile photos
    if (hasSplitFields || uploadedPreviewUrls.length > 0) {
      updateData.images = [
        ...existingPreviewImages,
        ...uploadedPreviewUrls,
        ...existingJpgImages,
        ...uploadedJpgUrls,
      ];
      updateData.has3dPreview = (existingPreviewImages.length + uploadedPreviewUrls.length) > 0;
    } else {
      updateData.images = [...remainingImages, ...uploadedPreviewUrls, ...uploadedJpgUrls];
      if (req.body.has3dPreview !== undefined) {
        updateData.has3dPreview = req.body.has3dPreview === "true" || req.body.has3dPreview === true;
      }
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