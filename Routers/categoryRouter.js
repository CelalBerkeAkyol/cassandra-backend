const express = require("express");
const router = express.Router();
const {
  getPostsByCategoriesName,
} = require("../controllers/categoryController");
const { getAllCategory } = require("../controllers/categoryController");
// kategori ismine göre postları döndüren api
router.get("/:category", getPostsByCategoriesName);
// postların kategorilerini
router.get("/all-categories", getAllCategory);

module.exports = router;
