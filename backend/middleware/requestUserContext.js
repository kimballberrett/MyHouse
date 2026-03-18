const attachRequestUserContext = (req, res, next) => {
  const headerUserId = req.header("x-user-id");

  if (headerUserId === undefined || headerUserId === "") {
    req.user = null;
    return next();
  }

  const parsed = Number(headerUserId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return res.status(400).json({ error: "Invalid x-user-id header. Expected a positive integer." });
  }

  req.user = {
    id: parsed,
    source: "header",
  };

  return next();
};

module.exports = {
  attachRequestUserContext,
};
