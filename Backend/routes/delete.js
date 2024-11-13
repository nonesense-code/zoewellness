const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const { deleteProducts } = require("../controllers/deleteController");

router.post("/:id", deleteProducts);

module.exports = router;
