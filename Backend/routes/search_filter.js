const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const isLoggedIn = require("../utils/isLoggedIn");

const { searchProducts } = require("../controllers/searchController");

router.get("/item/name", isLoggedIn, async (req, res) => {
  const searchQuery = req.query.query;
  try {
    const matchingItems = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    }).select("name _id");

    res.json(matchingItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving search results" });
  }
});

router.post("/item", isLoggedIn, searchProducts);

module.exports = router;
