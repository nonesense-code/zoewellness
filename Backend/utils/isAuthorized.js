const jwt = require("jsonwebtoken");

const isAuthorized = (req, res, next) => {
  if (!req.cookies.allowed) {
    return res.redirect("/users/login");
  }

  try {
    const token = req.cookies.allowed;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.redirect("/users/login");
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("An error occurred in the authorization process:", error);
    return res.redirect("/users/login");
  }
};

module.exports = isAuthorized;
