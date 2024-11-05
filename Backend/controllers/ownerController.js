const { generateToken } = require("../utils/generateToken");

const authorizedUser = async (req, res) => {
  const { email, password } = req.body;

  const authorizedEmail = process.env.AUTHORIZED_EMAIL;
  const authorizedPassword = process.env.AUTHORIZED_PASSWORD;

  if (!email || !password) {
    return res.status(400).json({ message: "All the fields are required!" });
  }
  try {
    if (email !== authorizedEmail || password !== authorizedPassword) {
      return res
        .status(401)
        .json({ message: "E-mail or Password is incorrect" });
    }
    const token = generateToken({ email: authorizedEmail });
    res.cookie("allowed", token, { httpOnly: true });
    return res.redirect("/users/register");
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  authorizedUser,
};
