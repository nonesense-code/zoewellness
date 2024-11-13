const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const { editProducts } = require("../controllers/editController");

router.post("/:id", editProducts);

module.exports = router;
