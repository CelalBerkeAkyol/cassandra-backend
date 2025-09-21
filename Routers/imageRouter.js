// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  getImages,
  uploadImages,
  deleteImage,
  viewImage,
  uploadLocalImages,
  uploadJupyterZip,
  uploadJupyterFolder,
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

// Görsel görüntüleme - herkes erişebilir
// URL parametreleri: filename (görsel dosya adı)
router.get("/:id", viewImage);

// Çoklu görsel yükleme - sadece yazarlar ve adminler yapabilir
// Body parametreleri: image (max 50 dosya), altText (opsiyonel)
router.post(
  "/multiple",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.array("image", 50),
  uploadImages
);

// Local dosyalardan çoklu görsel yükleme - sadece yazarlar ve adminler
// Body parametreleri: image (max 50 dosya), altText (opsiyonel)
router.post(
  "/upload-local",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.array("image", 50),
  uploadLocalImages
);

// Görsel silme - sadece yazarlar (kendi görselleri) ve adminler yapabilir
// URL parametreleri: id (görsel ID'si)
// Yetki kontrolü imageController içinde yapılıyor
router.delete("/:id", getAccessToRoute, isAuthorOrAdmin, deleteImage);

// Jupyter notebook ZIP dosyası upload - sadece yazarlar ve adminler
// Body parametreleri: zip dosyası (tek dosya)
router.post(
  "/upload-jupyter-zip",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.single("zipFile"),
  uploadJupyterZip
);

// Jupyter notebook klasör upload - sadece yazarlar ve adminler
// Body parametreleri: folder files (çoklu dosya)
router.post(
  "/upload-jupyter-folder",
  getAccessToRoute,
  isAuthorOrAdmin,
  upload.array("folderFiles", 100),
  uploadJupyterFolder
);

module.exports = router;
