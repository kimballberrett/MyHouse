const express = require("express");
const authController = require("../controllers/authController");
const preferencesController = require("../controllers/preferencesController");
const { requireAuth } = require("../middleware/requireAuth");
const { validatePreferencesUpdate } = require("../middleware/validatePreferencesUpdate");

const router = express.Router();

router.post("/auth/login", authController.login);
router.post("/auth/signup", authController.signup);

router.get("/preferences", requireAuth, preferencesController.getPreferences);
router.put("/preferences", requireAuth, validatePreferencesUpdate, preferencesController.updatePreferences);

module.exports = router;
