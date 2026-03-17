const pool = require("../migrations/database");

/**
 * @typedef {Object} SavedListing
 * @property {number} saved_listing_id
 * @property {number} user_id
 * @property {number} listing_id
 * @property {Date} saved_at
 */

/**
 * @param {number} userId
 * @returns {Promise<SavedListing[]>}
 */
const getByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT sl.saved_listing_id, sl.user_id, sl.listing_id, sl.saved_at, l.*
     FROM saved_listings sl
     JOIN listings l ON l.listing_id = sl.listing_id
     WHERE sl.user_id = $1
     ORDER BY sl.saved_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * @param {number} userId
 * @param {number} listingId
 * @returns {Promise<SavedListing|null>}
 */
const save = async (userId, listingId) => {
  const result = await pool.query(
    `INSERT INTO saved_listings (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [userId, listingId]
  );
  return result.rows[0] || null;
};

/**
 * @param {number} userId
 * @param {number} listingId
 * @returns {Promise<void>}
 */
const remove = async (userId, listingId) => {
  await pool.query(
    "DELETE FROM saved_listings WHERE user_id = $1 AND listing_id = $2",
    [userId, listingId]
  );
};

module.exports = { getByUserId, save, remove };
