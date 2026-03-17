const express = require("express");
const preferencesController = require("../controllers/preferencesController");
const { validatePreferencesUpdate } = require("../middleware/validatePreferencesUpdate");

const router = express.Router();

router.get("/preferences", preferencesController.getPreferences);
router.put("/preferences", validatePreferencesUpdate, preferencesController.updatePreferences);

module.exports = router;
