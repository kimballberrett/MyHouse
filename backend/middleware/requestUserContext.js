const DEFAULT_DEMO_USER_ID = 1;

const parseDemoUserId = () => {
  const parsed = Number(process.env.DEMO_USER_ID);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_DEMO_USER_ID;
};

const attachRequestUserContext = (req, res, next) => {
  const headerUserId = req.header("x-user-id");
  const demoUserId = parseDemoUserId();

  if (headerUserId === undefined || headerUserId === "") {
    req.user = {
      id: demoUserId,
      source: "demo",
    };
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
