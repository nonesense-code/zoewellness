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

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("user", userSchema);
