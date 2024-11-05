const userModel = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async (req, res) => {
  let { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).send("All the fields are required!");
    }

    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let userData = await userModel.create({
      fullname,
      email,
      password: hash,
    });

    let token = generateToken(userData);
    if (token) {
      return res.redirect("/users/login");
    } else {
      return res.status(500).send({ message: "Error Registering New Account" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    return res.status(500).send("Server error");
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail and Password are required!" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "E-mail or Password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = generateToken(user);
    res.cookie("token", token);
    return res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.logoutUser = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};
