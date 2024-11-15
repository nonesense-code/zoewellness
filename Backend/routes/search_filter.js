const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const { searchProducts } = require("../controllers/searchController");

router.get("/item/:name", async (req, res) => {
  const searchQuery = req.params.name;
  const normalizedSearchQuery = searchQuery.replace(/\s+/g, "").toLowerCase();

  try {
    const matchingItems = await Product.find({
      // Apply regex to remove spaces and ignore case for the name field in the database
      name: {
        $regex: new RegExp(normalizedSearchQuery.split("").join("\\s*"), "i"),
      },
    }).select("name");

    res.json(matchingItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving search results" });
  }
});

router.post("/item", searchProducts);

module.exports = router;
