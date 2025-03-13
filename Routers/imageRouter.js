// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const imageController = require("../controllers/imageController");
const {
  getAccessToRoute,
  isAdmin,
  isAuthor,
  isAuthorOrAdmin,
} = require("../middlewares/authMiddleware");

// Görsel listeleme (sayfalı) endpoint'i - herkes erişebilir
router.get("/", imageController.getImages);

// Görsel yükleme - sadece yazarlar ve adminler yapabilir
router.post(
  "/multiple",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.array("image", 50),
  imageController.uploadImages
);

// Görsel silme - sadece yazarlar (kendi görselleri) ve adminler yapabilir
// Yetki kontrolü imageController içinde yapılıyor
router.delete(
  "/:id",
  getAccessToRoute,
  isAuthorOrAdmin,
  imageController.deleteImage
);

module.exports = router;
