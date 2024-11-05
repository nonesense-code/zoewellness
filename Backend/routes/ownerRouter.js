const express = require("express");
const router = express.Router();
const { authorizedUser } = require("../controllers/ownerController");

router.get("/", (req, res) => {
  res.render("AuthorizedPage", { error: null, success: null });
});

router.post("/", authorizedUser);

router.get("/logout", (req, res) => {
  res.cookie("allowed", "");
  res.redirect("/");
});

module.exports = router;
