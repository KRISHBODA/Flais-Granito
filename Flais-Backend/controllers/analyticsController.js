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

    const pdfMap = new Map();
    [...pdfViews, ...pdfDownloads].forEach((event) => {
      const key = event.targetId || event.targetLabel || event.path || "Unknown";
      const label = event.targetLabel || event.title || key;
      const current = pdfMap.get(key) || { key, label, views: 0, downloads: 0, total: 0 };
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
        recentEvents
      }
    });
  } catch (error) {
    console.error("[analyticsController] getAnalyticsSummary error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
