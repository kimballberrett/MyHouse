const pool = require("../migrations/database");

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} email
 * @property {string} password_hash
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
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email]
  );
  return result.rows[0] || null;
};

/**
 * @param {string} email
 * @param {string} passwordHash
 * @returns {Promise<User>}
 */
const create = async (email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING *`,
    [email, passwordHash]
  );
  return result.rows[0];
};

module.exports = { getById, getByEmail, create };
