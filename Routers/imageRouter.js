// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  getImages,
  uploadImages,
  deleteImage,
} = require("../controllers/imageController");
const {
  getAccessToRoute,
  isAdmin,
  isAuthor,
  isAuthorOrAdmin,
} = require("../middlewares/authMiddleware");

// Görselleri sayfalama ile listeleme - herkes erişebilir
// Query parametreleri: page (varsayılan: 1), limit (varsayılan: 9)
router.get("/", getImages);

// Çoklu görsel yükleme - sadece yazarlar ve adminler yapabilir
// Body parametreleri: image (max 50 dosya), altText (opsiyonel)
router.post(
  "/multiple",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.array("image", 50),
  uploadImages
);

// Görsel silme - sadece yazarlar (kendi görselleri) ve adminler yapabilir
// URL parametreleri: id (görsel ID'si)
// Yetki kontrolü imageController içinde yapılıyor
router.delete("/:id", getAccessToRoute, isAuthorOrAdmin, deleteImage);

module.exports = router;
