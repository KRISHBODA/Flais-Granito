const Product = require("../models/Product");
const uploadService = require("../services/storage/UploadService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
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

  sendSuccess(res, 201, { message: "Product created successfully", product });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
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

  sendSuccess(res, 200, {
    products,
    totalProducts,
    totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
    currentPage: Number(page),
  });
});

// @desc    Get Single Product
// @route   GET /api/products/:id (also accepts slug)
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  let query = {};
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    query = { _id: idOrSlug };
  } else {
    query = { slug: idOrSlug };
  }

  const product = await Product.findOne(query);
  if (!product) return sendError(res, 404, "Product not found");

  sendSuccess(res, 200, { product });
});

// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 404, "Product not found");

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
  sendSuccess(res, 200, { product: updatedProduct });
});

// @desc    Delete Product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return sendError(res, 404, "Product not found");
  }

  // Clean up local images
  if (product.images && product.images.length > 0) {
    for (const imagePath of product.images) {
      await uploadService.delete(imagePath);
    }
  }

  sendSuccess(res, 200, { message: "Product deleted successfully" });
});
