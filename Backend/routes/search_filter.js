const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const { searchProducts } = require("../controllers/searchController");

router.get("/item/:name", async (req, res) => {
  console.log(searchQuery);
  const searchQuery = req.params.name;
  const normalizedSearchQuery = searchQuery.replace(/\s+/g, "").toLowerCase();

  try {
    const matchingItems = await Product.find({
      name: {
        $regex: normalizedSearchQuery,
        $options: "i",
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
