const pool = require("../migrations/database");

/**
 * @typedef {Object} Listing
 * @property {number} listing_id
 * @property {string} title
 * @property {string|null} street_address
 * @property {string|null} city
 * @property {number} montly_rent
 * @property {number|null} num_bedrooms
 * @property {number|null} num_bathrooms
 * @property {string|null} description
 * @property {Date} date_scraped
 * @property {string|null} source_url
 */

/**
 * @typedef {Object} Amenity
 * @property {number} amenity_id
 * @property {string} amenity_name
 */

/**
 * @typedef {Object} ListingImage
 * @property {number} image_id
 * @property {number} listing_id
 * @property {string} image_url
 * @property {number} display_order
 */

/**
 * @returns {Promise<Listing[]>}
 */
const getAll = async () => {
  const result = await pool.query(
    "SELECT * FROM listings ORDER BY date_scraped DESC"
  );
  return result.rows;
};

/**
 * @param {number} listingId
 * @returns {Promise<Listing|null>}
 */
const getById = async (listingId) => {
  const result = await pool.query(
    "SELECT * FROM listings WHERE listing_id = $1",
    [listingId]
  );
  return result.rows[0] || null;
};

/**
 * @param {number} listingId
 * @returns {Promise<Amenity[]>}
 */
const getAmenities = async (listingId) => {
  const result = await pool.query(
    `SELECT a.amenity_id, a.amenity_name
     FROM amenities a
     JOIN listing_amenities la ON la.amenity_id = a.amenity_id
     WHERE la.listing_id = $1`,
    [listingId]
  );
  return result.rows;
};

/**
 * @param {number} listingId
 * @returns {Promise<ListingImage[]>}
 */
const getImages = async (listingId) => {
  const result = await pool.query(
    "SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY display_order",
    [listingId]
  );
  return result.rows;
};

module.exports = { getAll, getById, getAmenities, getImages };
