const userModel = require("../data/userModel");
const { hashPassword, verifyPassword } = require("../services/passwordService");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 8;
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const user = await userModel.getByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (!user.password_hash) {
      return res.status(500).json({
        error:
          "This account has no password set. Run the password-hash migration or recreate seeded data.",
      });
    }
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ error: "Email format is invalid." });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await userModel.getByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = hashPassword(password);
    const created = await userModel.create(email.trim().toLowerCase(), passwordHash);

    return res.status(201).json({
      user: {
        user_id: created.user_id,
        email: created.email,
      },
    });
  } catch (err) {
    if (err && err.code === "42703") {
      return res.status(500).json({
        error:
          "Database is missing users.password_hash. Run backend/migrations/add_password_hash_to_users.sql.",
      });
    }
    if (err && err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    return next(err);
  }
};

module.exports = {
  login,
  signup,
};
