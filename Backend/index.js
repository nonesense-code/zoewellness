require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Product = require("./models/Products");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("Home", { items: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Error loading products");
  }
});

app.get("/orders", (req, res) => {
  res.render("Orders");
});

app.get("/addproducts", (req, res) => {
  res.render("AddProducts");
});

app.post("/add-product", async (req, res) => {
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
});

app.post("/edit-product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, volume, qnt, rate, pv, bv } = req.body;
  console.log(name);

  try {
    if (!name || !volume || !rate || !pv || !bv) {
      console.log("All fields must be filled out!");
      return res.redirect("/");
    }

    await Product.findByIdAndUpdate(id, {
      name: name.toUpperCase(),
      volume: volume.toUpperCase(),
      qnt: qnt || null,
      rate,
      pv,
      bv,
    });
    console.log("Product updated successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error updating product:", err);
    res.redirect("/");
  }
});

app.get("/purchase/items", async (req, res) => {
  const query = req.query;
  const items = [];

  try {
    for (const [id, quantity] of Object.entries(query)) {
      const product = await Product.findById(id);
      if (product) {
        items.push({ product, quantity });
      }
    }

    res.render("checkout", { items });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error fetching product details");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
