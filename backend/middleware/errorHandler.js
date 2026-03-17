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
  return res.status(500).json({ error: "Internal Server Error" });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
