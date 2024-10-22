const express = require("express");
const router = express.Router();
const {
  getPostsByCategoriesName,
} = require("../controllers/categoryController");

router.get("/:category", getPostsByCategoriesName);

module.exports = router;
