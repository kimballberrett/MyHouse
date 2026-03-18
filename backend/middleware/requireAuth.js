const userModel = require("../data/userModel");

const requireAuth = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const user = await userModel.getById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "User is not authorized." });
    }

    req.user = {
      ...req.user,
      email: user.email,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requireAuth,
};
