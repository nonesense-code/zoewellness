const Product = require("../models/Products");

module.exports.addProducts = async (req, res) => {
  const { name, volume, qnt, rate, pv, bv } = req.body;

  try {
    if (!name || !volume || !rate || !pv || !bv) {
      console.log("All fields must be filled out!");
      return res.redirect("/");
    }

    const existingProduct = await Product.findOne({ name: name.toUpperCase() });
    if (existingProduct) {
      console.log("Product already exists!");
      return res.redirect("/");
    }

    const newProduct = new Product({
      name: name.toUpperCase(),
      volume: volume.toUpperCase(),
      qnt: qnt || null,
      rate,
      pv,
      bv,
    });
    await newProduct.save();
    console.log("Product added successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error adding product:", err);
    res.redirect("/");
  }
};
