require("dotenv").config();
const mongoose = require("mongoose");
const URI = process.env.URI;

const databaseConnection = async () => {
  try {
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log("MongoDBAtlas Connection successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

databaseConnection();

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  volume: { type: String, required: true },
  qnt: { type: Number },
  rate: { type: Number, required: true },
  pv: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d+(\.\d+)?$/.test(v.toString());
      },
      message: (props) =>
        `${props.value} is not a valid number (should be an integer or decimal)!`,
    },
  },
  bv: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d+(\.\d+)?$/.test(v.toString());
      },
      message: (props) =>
        `${props.value} is not a valid number (should be an integer or decimal)!`,
    },
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
