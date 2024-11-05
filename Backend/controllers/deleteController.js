const Product = require("../models/Products");

module.exports.deleteProducts = async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.redirect("/");
  }
};
