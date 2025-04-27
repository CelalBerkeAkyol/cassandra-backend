const express = require("express");
const {
  getPostsByCategoriesName,
  getAllCategories,
  getAllCategoriesWithDetails,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require("../controllers/categoryController");
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Genel endpoints
router.get("/all-categories", getAllCategories);
router.get("/categories-with-details", getAllCategoriesWithDetails);

// Admin kategori yönetim endpointleri (kimlik doğrulama gerekli)
router.post("/admin", [getAccessToRoute, isAdmin], createCategory);
router.get("/admin/:id", [getAccessToRoute, isAdmin], getCategoryById);
router.put("/admin/:id", [getAccessToRoute, isAdmin], updateCategory);
router.delete("/admin/:id", [getAccessToRoute, isAdmin], deleteCategory);

// Bu en sonda olmalı, çünkü dinamik bir route
router.get("/:category", getPostsByCategoriesName);

module.exports = router;
