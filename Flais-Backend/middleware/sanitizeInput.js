const isUnsafeKey = (key) => {
  if (!key) return false;
  const normalized = String(key);
  return (
    normalized === "__proto__" ||
    normalized === "constructor" ||
    normalized === "prototype" ||
    normalized.startsWith("$") ||
    normalized.includes(".")
  );
};

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object" && value.constructor === Object) {
    return sanitizeObject(value);
  }

  return value;
};

const sanitizeObject = (input) => {
  const output = {};

  for (const [key, value] of Object.entries(input || {})) {
    if (isUnsafeKey(key)) continue;
    output[key] = sanitizeValue(value);
  }

  return output;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = { sanitizeInput };
