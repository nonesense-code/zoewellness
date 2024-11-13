const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("/product", async (req, res) => {
  try {
    const product = await Product.find();
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "No products found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({product});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
