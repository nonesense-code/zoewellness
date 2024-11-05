const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const products = await Product.find();
    res.render("Home", { items: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error loading products");
  }
});

module.exports = router;
