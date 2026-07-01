const buckets = new Map();

const createRateLimit = ({ windowMs, max, message }) => {
  return (req, res, next) => {
    const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${req.baseUrl || ""}:${req.path || ""}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return res.status(429).json({
        success: false,
        message: message || "Too many requests, please try again later.",
      });
    }

    bucket.count += 1;
    next();
  };
};

module.exports = { createRateLimit };
