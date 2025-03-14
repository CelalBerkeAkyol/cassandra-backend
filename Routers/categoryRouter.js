const express = require("express");
const router = express.Router();
const {
  getPostsByCategoriesName,
  getAllCategories,
} = require("../controllers/categoryController");

// kategori ismine göre postları döndüren api
router.get("/all-categories", getAllCategories);
router.get("/:category", getPostsByCategoriesName);
// postların kategorilerini

module.exports = router;
