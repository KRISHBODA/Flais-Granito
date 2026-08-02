const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Server Error" : err.message,
    ...(isProduction ? {} : { error: err.message, stack: err.stack }),
  });
};

module.exports = { errorHandler };
