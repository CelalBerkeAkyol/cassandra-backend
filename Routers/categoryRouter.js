const express = require("express");
const router = express.Router();
const {
  getPostsByCategoriesName,
} = require("../controllers/categoryController");
const { getAllCategory } = require("../controllers/categoryController");
// kategori ismine göre postları döndüren api
router.get("/all-categories", getAllCategory);
router.get("/:category", getPostsByCategoriesName);
// postların kategorilerini

module.exports = router;
