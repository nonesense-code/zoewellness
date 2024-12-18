const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("/", (req, res) => {
  const allowedCookie = req.cookies.allowed;
  const cookieExist = allowedCookie !== undefined && allowedCookie !== "";
  res.render("Orders", { cookieExist });
});

router.get("/:id", async (req, res) => {
  const query = req.query;
  const items = [];
  const allowedCookie = req.cookies.allowed;
  const cookieExist = allowedCookie !== undefined && allowedCookie !== "";
  try {
    for (const [id, quantity] of Object.entries(query)) {
      const product = await Product.findById(id);
      if (product) {
        items.push({ product, quantity });
      }
    }
    res.render("checkout", { items, cookieExist });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error fetching product details");
  }
});

module.exports = router;
