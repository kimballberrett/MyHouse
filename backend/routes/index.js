const express = require("express");
const authController = require("../controllers/authController");
const preferencesController = require("../controllers/preferencesController");
const { requireAuth } = require("../middleware/requireAuth");
const listingsController = require("../controllers/listingsController");
const { validatePreferencesUpdate } = require("../middleware/validatePreferencesUpdate");

const router = express.Router();

router.post("/auth/login", authController.login);
router.post("/auth/signup", authController.signup);

router.get("/preferences", requireAuth, preferencesController.getPreferences);
router.put("/preferences", requireAuth, validatePreferencesUpdate, preferencesController.updatePreferences);
router.get("/listings", requireAuth, listingsController.getListings);

module.exports = router;
