const express = require("express");
const router = express.Router();
const isAuthorized = require("../../Backend/utils/isAuthorized");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("/register", isAuthorized, (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", isAuthorized, registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
