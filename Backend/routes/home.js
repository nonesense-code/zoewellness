const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("/", async (req, res) => {
  try {
    const allowedCookie = req.cookies.allowed;
    const cookieExist = allowedCookie !== undefined && allowedCookie !== "";
    const products = await Product.find();
    res.render("Home", { items: products, cookieExist });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error loading products");
  }
});

module.exports = router;
