const preferencesService = require("../services/preferencesService");

const getPreferences = async (req, res, next) => {
  try {
    const preferences = await preferencesService.getPreferencesForUser(req.user.id);
    res.json(preferences || null);
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const payload = req.validatedPreferences || req.body;
    const updated = await preferencesService.updatePreferencesForUser(req.user.id, payload);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPreferences, updatePreferences };
