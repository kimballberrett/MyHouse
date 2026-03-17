const ALLOWED_FIELDS = new Set([
  "min_price",
  "max_price",
  "max_distance_miles",
  "price_rank",
  "location_rank",
  "rooms_rank",
  "sociability_rank",
  "amenities_rank",
  "notification_frequency",
]);

const NUMERIC_FIELDS = new Set([
  "min_price",
  "max_price",
  "max_distance_miles",
  "price_rank",
  "location_rank",
  "rooms_rank",
  "sociability_rank",
  "amenities_rank",
]);

const validatePreferencesUpdate = (req, res, next) => {
  const payload = req.body;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Request body must be a JSON object." });
  }

  const keys = Object.keys(payload);
  if (keys.length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty." });
  }

  const unknownFields = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length > 0) {
    return res.status(400).json({
      error: "Request body contains unknown fields.",
      details: { unknownFields },
    });
  }

  const normalized = {};
  for (const key of keys) {
    const value = payload[key];

    if (NUMERIC_FIELDS.has(key)) {
      if (value !== null && (!Number.isFinite(value) || typeof value !== "number")) {
        return res.status(400).json({ error: `${key} must be a number or null.` });
      }
    }

    if (key === "notification_frequency") {
      if (value !== null && typeof value !== "string") {
        return res.status(400).json({ error: "notification_frequency must be a string or null." });
      }
    }

    normalized[key] = value;
  }

  req.validatedPreferences = normalized;
  return next();
};

module.exports = {
  validatePreferencesUpdate,
};
