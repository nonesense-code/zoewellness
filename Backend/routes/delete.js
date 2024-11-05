const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const { deleteProducts } = require("../controllers/deleteController");

router.post("/:id", isLoggedIn, deleteProducts);

module.exports = router;
