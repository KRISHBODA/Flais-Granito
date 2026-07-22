const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["page_view", "pdf_view", "pdf_download"]
    },
    pageKey: {
      type: String,
      default: ""
    },
    pageLabel: {
      type: String,
      default: ""
    },
    path: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    targetType: {
      type: String,
      default: ""
    },
    targetId: {
      type: String,
      default: ""
    },
    targetLabel: {
      type: String,
      default: ""
    },
    referrer: {
      type: String,
      default: ""
    },
    sessionId: {
      type: String,
      required: true
    },
    visitorId: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ pageKey: 1, createdAt: -1 });
analyticsEventSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
analyticsEventSchema.index({ visitorId: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
