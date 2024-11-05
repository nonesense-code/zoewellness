const userModel = require("../models/user-model");
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

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send("Error generating salt");

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) return res.status(500).send("Error hashing password");

        try {
          let userData = await userModel.create({
            fullname,
            email,
            password: hash,
          });

          let token = generateToken(userData);
          res.redirect("/users/login");
        } catch (createError) {
          console.error("Error creating user:", createError.message);
          return res.status(500).send("Error creating user");
        }
      });
    });
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
