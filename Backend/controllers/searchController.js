const Product = require("../models/Products");

module.exports.searchProducts = async (req, res) => {
  let { search_items } = req.body;

  if (!search_items) {
    return res.status(400).send("Search item is required.");
  }

  const normalizedInput = search_items.replace(/\s+/g, "").toLowerCase();

  try {
    const allowedCookie = req.cookies.allowed;
    const cookieExist = allowedCookie !== undefined && allowedCookie !== "";

    const products = await Product.aggregate([
      {
        $addFields: {
          normalizedName: {
            $toLower: {
              $replaceAll: { input: "$name", find: " ", replacement: "" },
            },
          },
        },
      },
      {
        $match: {
          normalizedName: normalizedInput,
        },
      },
    ]);

    res.render("Home", { items: products, cookieExist });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error.");
  }
};
