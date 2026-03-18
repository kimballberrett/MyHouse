const crypto = require("crypto");

const SALT_SIZE = 16;
const KEY_LENGTH = 64;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(SALT_SIZE);
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
};

const verifyPassword = (password, storedHash) => {
  if (typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
};

module.exports = {
  hashPassword,
  verifyPassword,
};
