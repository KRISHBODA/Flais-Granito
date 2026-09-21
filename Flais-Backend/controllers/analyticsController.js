const AnalyticsEvent = require("../models/AnalyticsEvent");

const VALID_EVENT_TYPES = new Set(["page_view", "pdf_view", "pdf_download"]);

function cleanString(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 500);
}

function buildPageKey(payload = {}) {
  return cleanString(payload.pageKey || payload.pageLabel || payload.path || "unknown") || "unknown";
}

exports.logAnalyticsEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const eventType = cleanString(payload.eventType);
    const sessionId = cleanString(payload.sessionId);
    const visitorId = cleanString(payload.visitorId);

    if (!VALID_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ success: false, message: "Invalid event type" });
    }

    if (!sessionId || !visitorId) {
      return res.status(400).json({ success: false, message: "sessionId and visitorId are required" });
    }

    const event = await AnalyticsEvent.create({
      eventType,
      pageKey: buildPageKey(payload),
      pageLabel: cleanString(payload.pageLabel),
      path: cleanString(payload.path),
      title: cleanString(payload.title),
      targetType: cleanString(payload.targetType),
      targetId: cleanString(payload.targetId),
      targetLabel: cleanString(payload.targetLabel),
      referrer: cleanString(payload.referrer),
      sessionId,
      visitorId,
      userAgent: cleanString(req.get("user-agent")),
      ipAddress: cleanString((req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0]),
      metadata: typeof payload.metadata === "object" && payload.metadata !== null ? payload.metadata : {}
    });

    res.status(201).json({ success: true, eventId: event._id.toString() });
  } catch (error) {
    console.error("[analyticsController] logAnalyticsEvent error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(parseInt(req.query.days, 10) || 30, 365));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await AnalyticsEvent.find({ createdAt: { $gte: since } }).lean();

    const totalEvents = events.length;
    const pageViews = events.filter((event) => event.eventType === "page_view");
    const pdfViews = events.filter((event) => event.eventType === "pdf_view");
    const pdfDownloads = events.filter((event) => event.eventType === "pdf_download");
    const uniqueVisitors = new Set(events.map((event) => event.visitorId).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map((event) => event.sessionId).filter(Boolean)).size;

    const topPagesMap = new Map();
    pageViews.forEach((event) => {
      const key = event.pageKey || event.path || event.pageLabel || "Unknown";
      const label = event.pageLabel || key;
      const current = topPagesMap.get(key) || { key, label, count: 0 };
      current.count += 1;
      topPagesMap.set(key, current);
    });

    const CatalogPage = require("../models/CatalogPage");
    let catalogTitleLookup = new Map();
    try {
      const catalogPage = await CatalogPage.findOne().lean();
      if (catalogPage && Array.isArray(catalogPage.catalogs)) {
        catalogPage.catalogs.forEach((cat) => {
          if (cat.title) {
            if (cat._id) catalogTitleLookup.set(cat._id.toString(), cat.title);
            if (cat.flipPath) {
              catalogTitleLookup.set(cat.flipPath.toLowerCase(), cat.title);
              catalogTitleLookup.set(cat.flipPath.replace(/^flipbooks\//i, "").toLowerCase(), cat.title);
            }
            if (cat.link) catalogTitleLookup.set(cat.link.toLowerCase(), cat.title);
          }
        });
      }
    } catch (err) {
      console.warn("[analyticsController] CatalogPage lookup failed:", err.message);
    }

    const pdfMap = new Map();
    [...pdfViews, ...pdfDownloads].forEach((event) => {
      let rawLabel = cleanString(event.targetLabel || event.title);
      if (!rawLabel && event.targetId) {
        const idKey = event.targetId.trim().toLowerCase();
        rawLabel = catalogTitleLookup.get(idKey) || catalogTitleLookup.get(idKey.replace(/^flipbooks\//i, "")) || cleanString(event.targetId);
      }
      if (!rawLabel) {
        rawLabel = cleanString(event.path) || "Untitled PDF";
      }

      const label = rawLabel;
      const key = label.toLowerCase().trim();
      const current = pdfMap.get(key) || { key, label, views: 0, downloads: 0, total: 0 };

      // Keep the most descriptive, formatted display label
      if (event.targetLabel && (current.label === "Untitled PDF" || current.label.includes("/") || current.label === current.key)) {
        current.label = cleanString(event.targetLabel);
      }

      if (event.eventType === "pdf_view") current.views += 1;
      if (event.eventType === "pdf_download") current.downloads += 1;
      current.total += 1;
      pdfMap.set(key, current);
    });

    const dailyMap = new Map();
    events.forEach((event) => {
      const dayKey = event.createdAt.toISOString().slice(0, 10);
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, { date: dayKey, pageViews: 0, pdfViews: 0, pdfDownloads: 0, total: 0 });
      }
      const bucket = dailyMap.get(dayKey);
      bucket.total += 1;
      if (event.eventType === "page_view") bucket.pageViews += 1;
      if (event.eventType === "pdf_view") bucket.pdfViews += 1;
      if (event.eventType === "pdf_download") bucket.pdfDownloads += 1;
    });

    const topPages = [...topPagesMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topPdfs = [...pdfMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const dailySeries = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

    const recentEvents = events
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 25)
      .map((event) => ({
        _id: event._id,
        eventType: event.eventType,
        pageLabel: event.pageLabel,
        pageKey: event.pageKey,
        title: event.title,
        targetLabel: event.targetLabel,
        targetType: event.targetType,
        path: event.path,
        createdAt: event.createdAt,
        visitorId: event.visitorId
      }));

    // Aggregate collection photo counts and product breakdown
    const Product = require("../models/Product");
    let collectionStats = {
      totalPhotos: 0,
      totalProducts: 0,
      totalTilesUploaded: 0,
      total360Links: 0,
      collectionsCount: 0,
      collectionsWith360Count: 0,
      percentage360Coverage: 0,
      collections: []
    };

    try {
      const agg = await Product.aggregate([
        {
          $group: {
            _id: "$category",
            productCount: { $sum: 1 },
            photoCount: { $sum: { $size: { $ifNull: ["$images", []] } } },
            link360Count: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: [{ $strLenCP: { $trim: { input: { $ifNull: ["$link360", ""] } } } }, 0] },
                      { $ne: [{ $toLower: { $ifNull: ["$link360", ""] } }, "null"] },
                      { $ne: [{ $toLower: { $ifNull: ["$link360", ""] } }, "undefined"] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            sampleImages: { $push: { $slice: ["$images", 3] } }
          }
        },
        { $sort: { photoCount: -1 } }
      ]);

      const totalPhotos = agg.reduce((sum, item) => sum + (item.photoCount || 0), 0);
      const totalProducts = agg.reduce((sum, item) => sum + (item.productCount || 0), 0);
      const total360Links = agg.reduce((sum, item) => sum + (item.link360Count || 0), 0);

      const collections = agg.map((item) => {
        const previewImages = (item.sampleImages || []).flat().filter(Boolean).slice(0, 4);
        const link360Count = item.link360Count || 0;
        return {
          collectionName: item._id || "Uncategorized",
          productCount: item.productCount || 0,
          tilesUploaded: item.productCount || 0, // 1 per unique tile design uploaded
          photoCount: item.photoCount || 0,     // Total photos across all tile designs
          preview3DCount: item.productCount || 0, // 3D preview photo (#1 photo on collection page)
          simpleTileJpgCount: Math.max(0, (item.photoCount || 0) - (item.productCount || 0)), // Simple tile photo (remaining photos)
          link360Count,                         // Count of 360 photo links in this collection
          has360: link360Count > 0,
          percentageOfProducts: totalProducts > 0 ? Number(((item.productCount / totalProducts) * 100).toFixed(1)) : 0,
          percentageOfPhotos: totalPhotos > 0 ? Number(((item.photoCount / totalPhotos) * 100).toFixed(1)) : 0,
          percentageOf360: total360Links > 0 ? Number(((link360Count / total360Links) * 100).toFixed(1)) : 0,
          percentage360Coverage: item.productCount > 0 ? Number(((link360Count / item.productCount) * 100).toFixed(1)) : 0,
          avgPhotosPerProduct: item.productCount > 0 ? Number((item.photoCount / item.productCount).toFixed(1)) : 0,
          previewImages
        };
      });

      const collectionsWith360Count = collections.filter((c) => c.has360).length;

      collectionStats = {
        totalPhotos,
        totalProducts,
        totalTilesUploaded: totalProducts,
        total3DPreviews: totalProducts,
        totalSimpleTileJpg: Math.max(0, totalPhotos - totalProducts),
        total360Links,
        collectionsCount: collections.length,
        collectionsWith360Count,
        percentage360Coverage: totalProducts > 0 ? Number(((total360Links / totalProducts) * 100).toFixed(1)) : 0,
        collections
      };
    } catch (err) {
      console.warn("[analyticsController] Product collection photos lookup failed:", err.message);
    }

    res.status(200).json({
      success: true,
      summary: {
        rangeDays: days,
        totalEvents,
        pageViews: pageViews.length,
        pdfViews: pdfViews.length,
        pdfDownloads: pdfDownloads.length,
        uniqueVisitors,
        uniqueSessions,
        topPages,
        topPdfs,
        dailySeries,
        recentEvents,
        collectionPhotos: collectionStats
      }
    });
  } catch (error) {
    console.error("[analyticsController] getAnalyticsSummary error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getCollectionPhotosSummary = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const agg = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          photoCount: { $sum: { $size: { $ifNull: ["$images", []] } } },
          link360Count: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $strLenCP: { $trim: { input: { $ifNull: ["$link360", ""] } } } }, 0] },
                    { $ne: [{ $toLower: { $ifNull: ["$link360", ""] } }, "null"] },
                    { $ne: [{ $toLower: { $ifNull: ["$link360", ""] } }, "undefined"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          sampleImages: { $push: { $slice: ["$images", 3] } }
        }
      },
      { $sort: { photoCount: -1 } }
    ]);

    const totalPhotos = agg.reduce((sum, item) => sum + (item.photoCount || 0), 0);
    const totalProducts = agg.reduce((sum, item) => sum + (item.productCount || 0), 0);
    const total360Links = agg.reduce((sum, item) => sum + (item.link360Count || 0), 0);

    const collections = agg.map((item) => {
      const previewImages = (item.sampleImages || []).flat().filter(Boolean).slice(0, 4);
      const link360Count = item.link360Count || 0;
      return {
        collectionName: item._id || "Uncategorized",
        productCount: item.productCount || 0,
        tilesUploaded: item.productCount || 0,
        photoCount: item.photoCount || 0,
        preview3DCount: item.productCount || 0, // 3D preview photo (#1 photo on collection page)
        simpleTileJpgCount: Math.max(0, (item.photoCount || 0) - (item.productCount || 0)), // Simple tile photo (remaining photos)
        link360Count,
        has360: link360Count > 0,
        percentageOfProducts: totalProducts > 0 ? Number(((item.productCount / totalProducts) * 100).toFixed(1)) : 0,
        percentageOfPhotos: totalPhotos > 0 ? Number(((item.photoCount / totalPhotos) * 100).toFixed(1)) : 0,
        percentageOf360: total360Links > 0 ? Number(((link360Count / total360Links) * 100).toFixed(1)) : 0,
        percentage360Coverage: item.productCount > 0 ? Number(((link360Count / item.productCount) * 100).toFixed(1)) : 0,
        avgPhotosPerProduct: item.productCount > 0 ? Number((item.photoCount / item.productCount).toFixed(1)) : 0,
        previewImages
      };
    });

    const collectionsWith360Count = collections.filter((c) => c.has360).length;

    res.status(200).json({
      success: true,
      data: {
        totalPhotos,
        totalProducts,
        totalTilesUploaded: totalProducts,
        total3DPreviews: totalProducts,
        totalSimpleTileJpg: Math.max(0, totalPhotos - totalProducts),
        total360Links,
        collectionsCount: collections.length,
        collectionsWith360Count,
        percentage360Coverage: totalProducts > 0 ? Number(((total360Links / totalProducts) * 100).toFixed(1)) : 0,
        collections
      }
    });
  } catch (error) {
    console.error("[analyticsController] getCollectionPhotosSummary error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
