const express = require("express");
const router = express.Router();
const {
  getPostsByCategoriesName,
  getAllCategories,
} = require("../controllers/categoryController");

// Tüm kategorileri listele - herkes erişebilir
// Response: Kategori listesi (Post modelindeki enum değerleri)
router.get("/all-categories", getAllCategories);

// Belirli bir kategoriye ait tüm postları getir - herkes erişebilir
// URL parametreleri: category (kategori adı)
// Response: Belirtilen kategorideki tüm postlar
router.get("/:category", getPostsByCategoriesName);

module.exports = router;
