const listingsService = require("../services/listingsService");

const getListings = async (req, res, next) => {
  try {
    const listings = await listingsService.getAllListings();
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

module.exports = { getListings };
