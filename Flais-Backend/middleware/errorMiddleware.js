const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    console.error("[errorHandler]", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode >= 500 ? "Server Error" : err.message,
    stack: isProduction ? null : err.stack,
  });
};

module.exports = { errorHandler };
