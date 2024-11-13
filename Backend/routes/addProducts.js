const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const { addProducts } = require("../controllers/productsController");

router.get("/", (req, res) => {
  const allowedCookie = req.cookies.allowed;
  const cookieExist = allowedCookie !== undefined && allowedCookie !== "";
  res.render("AddProducts", { cookieExist });
});

router.post("/add", addProducts);

module.exports = router;
