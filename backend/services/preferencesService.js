const preferencesModel = require("../data/userPreferencesModel");

const PREFERENCE_FIELDS = [
  "min_price",
  "max_price",
  "max_distance_miles",
  "price_rank",
  "location_rank",
  "rooms_rank",
  "sociability_rank",
  "amenities_rank",
  "notification_frequency",
];

const buildMergedPreferences = (existing, incoming) => {
  const merged = {};

  for (const field of PREFERENCE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(incoming, field)) {
      merged[field] = incoming[field];
      continue;
    }

    if (existing && Object.prototype.hasOwnProperty.call(existing, field)) {
      merged[field] = existing[field];
      continue;
    }

    merged[field] = null;
  }

  return merged;
};

const getPreferencesForUser = async (userId) => {
  return preferencesModel.getByUserId(userId);
};

const updatePreferencesForUser = async (userId, incoming) => {
  const existing = await preferencesModel.getByUserId(userId);
  const merged = buildMergedPreferences(existing, incoming);

  return preferencesModel.upsert(userId, merged);
};

module.exports = {
  getPreferencesForUser,
  updatePreferencesForUser,
};
