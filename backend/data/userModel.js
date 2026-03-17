const pool = require("../migrations/database");

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} email
 * @property {string|null} phone_number
 * @property {Date} created_at
 * @property {string|null} notification_frequency
 */

/**
 * @param {number} userId
 * @returns {Promise<User|null>}
 */
const getById = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE user_id = $1",
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * @param {string} email
 * @returns {Promise<User|null>}
 */
const getByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
};

module.exports = { getById, getByEmail };
