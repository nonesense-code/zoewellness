const Product = require("../models/Products");

module.exports.editProducts = async (req, res) => {
  try {
    const { name, volume, rate, pv, bv } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        volume,
        rate,
        pv,
        bv,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
};
