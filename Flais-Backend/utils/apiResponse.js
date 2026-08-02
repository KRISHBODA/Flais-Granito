// Standard JSON response helpers so every controller returns a consistent
// { success, ... } envelope without repeating the literal in each handler.
const sendSuccess = (res, statusCode = 200, payload = {}) =>
  res.status(statusCode).json({ success: true, ...payload });

const sendError = (res, statusCode = 500, message = "Server Error", extra = {}) =>
  res.status(statusCode).json({ success: false, message, ...extra });

module.exports = { sendSuccess, sendError };
