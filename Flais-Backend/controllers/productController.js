const Product = require("../models/Product");
const uploadService = require("../services/storage/UploadService");

const MAX_PAGE_SIZE = 1000;
const MAX_SEARCH_LENGTH = 100;
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SURFACES_BY_SIZE = {
  "600x1200": ["Glossy", "High Glossy", "Carving", "Matt", "Satin Matt"],
  "800x1600": ["Ligh Glass", "Dark Glass", "Glossy", "High Glossy", "Matt", "Carving"],
  "1200x1800": [
    "Light Polished", 
    "Dark Polished", 
    "Full Dark Polished", 
    "Polished", 
    "Liso", 
    "Liso+Carving", 
    "Marble Gloss", 
    "Matt", 
    "Carving"
  ],
  "1200x2400": [
    "Light Polished", 
    "Liso", 
    "Liso+Carving",
    "Glossy"
  ],
  "800x2400_Fullbody": [
    "Polished",
    "Matt",
    "Liso",
    "Carving"
  ],
  "800x2400_Colorbody": [
    "Polished",
    "Matt",
    "Liso",
    "Liso+Carving",
    "Marble Gloss"
  ]
};

const CANONICAL_BODY_TYPES = [
  "White",
  "Ivory",
  "Grey",
  "Black",
  "Green",
  "Brown",
  "Choco",
  "Verde"
];

const getSurfaceRegex = (token) => {
  const clean = String(token).trim();
  if (/liso\s*\+?\s*carving/i.test(clean) || /liso\s*\+\s*cr/i.test(clean)) {
    return /(^|\s*\/\s*)(LISO\s*\+\s*(CARVING|CR))(\s*\/\s*|$)/i;
  }
  if (/ligh(t)?\s*polished/i.test(clean)) {
    return /(^|\s*\/\s*)LIGHT\s*POLISHED(\s*\/\s*|$)/i;
  }
  if (/ligh(t)?\s*glass/i.test(clean)) {
    return /(^|\s*\/\s*)LIGH(T)?\s*GLASS(\s*\/\s*|$)/i;
  }
  return new RegExp(`(^|\\s*\\/\\s*)${escapeRegExp(clean)}(\\s*\\/\\s*|$)`, "i");
};

const matchProductSize = (product, sizeKey) => {
  if (!product || !product.size) return false;
  const pSize = String(product.size).trim();
  const target = String(sizeKey).trim();

  // If sizeKey is 800x2400_Fullbody
  if (/800.*2400.*full\s*body/i.test(target)) {
    if (/800\s*x\s*2400[-_\s]*full\s*body/i.test(pSize)) return true;
    if (/800\s*x\s*2400/i.test(pSize)) {
      if (/full\s*body/i.test(product.color || "") || 
          /full\s*body/i.test(product.category || "") ||
          /full\s*body/i.test(product.title || "")) {
        return true;
      }
    }
    return false;
  }

  // If sizeKey is 800x2400_Colorbody
  if (/800.*2400.*color\s*body/i.test(target)) {
    if (/800\s*x\s*2400[-_\s]*color\s*body/i.test(pSize)) return true;
    if (/800\s*x\s*2400/i.test(pSize)) {
      if (/color\s*body/i.test(product.color || "") || 
          /color\s*body/i.test(product.category || "") ||
          /color\s*body/i.test(product.title || "")) {
        return true;
      }
    }
    return false;
  }

  // General sizes: 600x1200, 800x1600, 1200x1800, 1200x2400
  const normP = pSize.toLowerCase().replace(/[-_\s]/g, "");
  const normT = target.toLowerCase().replace(/[-_\s]/g, "");
  return normP === normT;
};

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
      size = "All",
      surface = "All",
      finish = "All",
      bodyType = "All",
      color = "All"
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
      const clean = String(size).trim();
      if (/800.*2400.*full\s*body/i.test(clean)) {
        andConditions.push({
          $or: [
            { size: { $regex: /^800\s*x\s*2400[-_\s]*full\s*body$/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, color: { $regex: /full\s*body/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, category: { $regex: /full\s*body/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, title: { $regex: /full\s*body/i } }
          ]
        });
      } else if (/800.*2400.*color\s*body/i.test(clean)) {
        andConditions.push({
          $or: [
            { size: { $regex: /^800\s*x\s*2400[-_\s]*color\s*body$/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, color: { $regex: /color\s*body/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, category: { $regex: /color\s*body/i } },
            { size: { $regex: /^800\s*x\s*2400/i }, title: { $regex: /color\s*body/i } }
          ]
        });
      } else {
        andConditions.push({
          size: { $regex: new RegExp(`^${escapeRegExp(clean).replace(/_/g, "[-_\\s]?")}$`, "i") }
        });
      }
    }

    // Surface / Finish filter
    const chosenSurface = (surface && surface !== "All" && surface !== "all")
      ? surface
      : (finish && finish !== "All" && finish !== "all" ? finish : null);

    if (chosenSurface) {
      andConditions.push({
        finishes: { $regex: getSurfaceRegex(chosenSurface) }
      });
    }

    // Body Type / Color filter
    const chosenBodyType = (bodyType && bodyType !== "All" && bodyType !== "all")
      ? bodyType
      : (color && color !== "All" && color !== "all" ? color : null);

    if (chosenBodyType) {
      andConditions.push({
        color: { $regex: new RegExp(`^${escapeRegExp(chosenBodyType).trim()}$`, "i") }
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
      sizeAgg,
      allProductsFinishes
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
      ]),
      Product.find({}, { size: 1, finishes: 1, color: 1, category: 1, title: 1 })
    ]);

    const KNOWN_SIZE_KEYS = Object.keys(SURFACES_BY_SIZE);
    const combinedSizes = [...KNOWN_SIZE_KEYS];
    for (const s of (distinctSizes || []).filter(Boolean)) {
      if (!combinedSizes.some(cs => cs.toLowerCase() === s.toLowerCase())) {
        combinedSizes.push(s);
      }
    }
    combinedSizes.sort();

    // 1. Compute full filter matrix for cross-filtering across all catalog products
    const categorySizes = {}; // { [category]: { [sizeKey]: count } }
    const sizeCategories = {}; // { [sizeKey]: { [category]: count } }
    const surfaceSizes = {}; // { [surface]: { [sizeKey]: count } }
    const surfaceCategories = {}; // { [surface]: { [category]: count } }
    const categoryCountsOverall = {};
    const sizeCountsOverall = {};

    const allSurfacesSet = new Set();
    Object.values(SURFACES_BY_SIZE).forEach(list => list.forEach(s => allSurfacesSet.add(s)));

    for (const surf of allSurfacesSet) {
      surfaceSizes[surf] = {};
      surfaceCategories[surf] = {};
    }

    for (const p of (allProductsFinishes || [])) {
      const cat = p.category || "Uncategorized";
      categoryCountsOverall[cat] = (categoryCountsOverall[cat] || 0) + 1;

      for (const sizeKey of KNOWN_SIZE_KEYS) {
        if (matchProductSize(p, sizeKey)) {
          if (!categorySizes[cat]) categorySizes[cat] = {};
          categorySizes[cat][sizeKey] = (categorySizes[cat][sizeKey] || 0) + 1;

          if (!sizeCategories[sizeKey]) sizeCategories[sizeKey] = {};
          sizeCategories[sizeKey][cat] = (sizeCategories[sizeKey][cat] || 0) + 1;

          sizeCountsOverall[sizeKey] = (sizeCountsOverall[sizeKey] || 0) + 1;
        }
      }

      for (const surf of allSurfacesSet) {
        const reg = getSurfaceRegex(surf);
        if (reg.test(p.finishes || "")) {
          surfaceCategories[surf][cat] = (surfaceCategories[surf][cat] || 0) + 1;
          for (const sizeKey of KNOWN_SIZE_KEYS) {
            if (matchProductSize(p, sizeKey)) {
              surfaceSizes[surf][sizeKey] = (surfaceSizes[surf][sizeKey] || 0) + 1;
            }
          }
        }
      }
    }

    const surfaceRegex = chosenSurface ? getSurfaceRegex(chosenSurface) : null;

    // 2. Active Category counts (dynamically filtered by current selected size AND surface)
    const activeCategoryCounts = {};
    for (const p of (allProductsFinishes || [])) {
      const cat = p.category;
      if (!cat) continue;
      const matchSz = (!size || size === "All" || size === "all") ? true : matchProductSize(p, size);
      const matchSurf = !surfaceRegex ? true : surfaceRegex.test(p.finishes || "");
      if (matchSz && matchSurf) {
        activeCategoryCounts[cat] = (activeCategoryCounts[cat] || 0) + 1;
      }
    }

    // 3. Active Size counts (dynamically filtered by current selected category AND surface)
    const activeSizeCounts = {};
    for (const sizeKey of KNOWN_SIZE_KEYS) {
      activeSizeCounts[sizeKey] = (allProductsFinishes || []).filter(p => {
        const matchCat = (!category || category === "All" || category === "All Categories") ? true : (p.category === category);
        const matchSurf = !surfaceRegex ? true : surfaceRegex.test(p.finishes || "");
        return matchCat && matchSurf && matchProductSize(p, sizeKey);
      }).length;
    }

    // 4. Surface counts (dynamically filtered by current selected category)
    const surfaceCounts = {
      overall: {}
    };

    for (const sizeKey of KNOWN_SIZE_KEYS) {
      surfaceCounts[sizeKey] = {};
    }

    for (const [sizeKey, surfaceList] of Object.entries(SURFACES_BY_SIZE)) {
      for (const surf of surfaceList) {
        const reg = getSurfaceRegex(surf);
        const countForSize = (allProductsFinishes || []).filter(p => {
          const matchCat = (!category || category === "All" || category === "All Categories") ? true : (p.category === category);
          return matchCat && matchProductSize(p, sizeKey) && reg.test(p.finishes || "");
        }).length;
        surfaceCounts[sizeKey][surf] = countForSize;

        if (surfaceCounts.overall[surf] === undefined) {
          const totalCount = (allProductsFinishes || []).filter(p => {
            const matchCat = (!category || category === "All" || category === "All Categories") ? true : (p.category === category);
            return matchCat && reg.test(p.finishes || "");
          }).length;
          surfaceCounts.overall[surf] = totalCount;
        }
      }
    }
    
    // 5. Body Type counts across canonical 8 types + GVT
    const bodyTypeCounts = {};
    for (const bt of CANONICAL_BODY_TYPES) {
      const reg = new RegExp(`^${escapeRegExp(bt)}$`, "i");
      bodyTypeCounts[bt] = (allProductsFinishes || []).filter(p => reg.test((p.color || "").trim())).length;
    }
    bodyTypeCounts["GVT"] = (allProductsFinishes || []).filter(p => /gvt/i.test((p.color || "").trim())).length;
    
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
      distinctSizes: combinedSizes,
      sizeCounts: activeSizeCounts,
      categoryCounts: activeCategoryCounts,
      surfaceCounts,
      surfacesBySize: SURFACES_BY_SIZE,
      bodyTypeCounts,
      bodyTypes: CANONICAL_BODY_TYPES,
      filterMatrix: {
        categorySizes,
        sizeCategories,
        surfaceSizes,
        surfaceCategories,
        categoryCountsOverall,
        sizeCountsOverall,
      },
    };

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
      currentPage: Number(page),
      mediaStats,
      sizes: combinedSizes,
      surfacesBySize: SURFACES_BY_SIZE,
      surfaceCounts,
      categoryCounts: activeCategoryCounts,
      bodyTypeCounts,
      bodyTypes: CANONICAL_BODY_TYPES,
      filterMatrix: mediaStats.filterMatrix,
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