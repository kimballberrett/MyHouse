const pool = require("../migrations/database");

/**
 * @typedef {Object} UserPreferences
 * @property {number} preference_id
 * @property {number} user_id
 * @property {number|null} min_price
 * @property {number|null} max_price
 * @property {number|null} max_distance_miles
 * @property {number|null} price_rank
 * @property {number|null} location_rank
 * @property {number|null} rooms_rank
 * @property {number|null} sociability_rank
 * @property {number|null} amenities_rank
 * @property {string|null} notification_frequency
 */

const SELECT_PREFERENCES = `
  SELECT up.preference_id, up.user_id, up.min_price, up.max_price,
         up.max_distance_miles, up.price_rank, up.location_rank,
         up.rooms_rank, up.sociability_rank, up.amenities_rank,
         u.notification_frequency
  FROM user_preferences up
  JOIN users u ON u.user_id = up.user_id
  WHERE up.user_id = $1
`;

/**
 * @param {number} userId
 * @returns {Promise<UserPreferences|null>}
 */
const getByUserId = async (userId) => {
  const result = await pool.query(SELECT_PREFERENCES, [userId]);
  return result.rows[0] || null;
};

/**
 * @param {number} userId
 * @param {Partial<UserPreferences>} data
 * @returns {Promise<UserPreferences>}
 */
const upsert = async (userId, data) => {
  const {
    min_price, max_price, max_distance_miles,
    price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank,
    notification_frequency,
  } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO user_preferences
         (user_id, min_price, max_price, max_distance_miles,
          price_rank, location_rank, rooms_rank, sociability_rank, amenities_rank)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET
         min_price = EXCLUDED.min_price,
         max_price = EXCLUDED.max_price,
         max_distance_miles = EXCLUDED.max_distance_miles,
         price_rank = EXCLUDED.price_rank,
         location_rank = EXCLUDED.location_rank,
         rooms_rank = EXCLUDED.rooms_rank,
         sociability_rank = EXCLUDED.sociability_rank,
         amenities_rank = EXCLUDED.amenities_rank`,
      [
        userId,
        min_price,
        max_price,
        max_distance_miles,
        price_rank,
        location_rank,
        rooms_rank,
        sociability_rank,
        amenities_rank,
      ]
    );

    if (notification_frequency !== undefined) {
      await client.query(
        "UPDATE users SET notification_frequency = $1 WHERE user_id = $2",
        [notification_frequency, userId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getByUserId(userId);
};

module.exports = { getByUserId, upsert };
