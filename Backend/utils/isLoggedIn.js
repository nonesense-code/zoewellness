const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

module.exports = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.redirect("/users/login");
  }
  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    let user = await userModel.findOne({ email: decoded.email });
    req.user = user;
    next();
  } catch (error) {
    console.error("Error", error);
    res.redirect("/users/login");
  }
};
