const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const { addProducts } = require("../controllers/productsController");

router.get("/", isLoggedIn, (req, res) => {
  res.render("AddProducts");
});

router.post("/add", isLoggedIn, addProducts);

module.exports = router;
