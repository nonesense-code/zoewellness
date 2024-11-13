const express = require("express");
const router = express.Router();
const isAuthorized = require("../../Backend/utils/isAuthorized");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const isLoggedIn = require("../utils/isLoggedIn");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
