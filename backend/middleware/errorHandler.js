const notFoundHandler = (req, res) => {
  return res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload." });
  }

  console.error(error);
  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: "Internal Server Error",
    ...(isProd ? {} : { details: error?.message || "Unknown error" }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
