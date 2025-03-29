const express = require("express");
const router = express.Router();
const {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,
  getUserByUserNameFromDatabase,
  getUserByID,
  deleteUserByID,
  updateUserRole,
  getAuthorsAndAdmins,
} = require("../controllers/userController.js");
const {
  getAccessToRoute,
  isAdmin,
  isOwnerOrAdminForUser,
} = require("../middlewares/authMiddleware.js"); // kullanıcı kontrolü burada yapılıyor

const { cleanupUserData } = require("../middlewares/databaseMiddleware.js"); // Kullanıcı verilerini temizleme middleware'i

// Authors and Admins endpoint - public access
router.get("/team", getAuthorsAndAdmins);

// Ortak yol prefix'i kullanılarak rotalar birleştirildi
router.use(getAccessToRoute); // Tüm rotalarda erişim kontrolü

// Kullanıcı bilgisi getirme - giriş yapmış herkes erişebilir
router.get("/username/:username", getUserByUserNameFromDatabase);
router.get("/:id", getUserByID);

// Kullanıcı güncelleme ve silme - kullanıcının kendisi veya admin yapabilir
router
  .route("/:id")
  .put(isOwnerOrAdminForUser, updateUserFromDatabase)
  .delete(isOwnerOrAdminForUser, cleanupUserData, deleteUserByID); // Kullanıcılar kendi hesaplarını silebilir

// Sadece admin erişebilen rotalar
router.patch("/:id/role", isAdmin, updateUserRole); // Kullanıcı rolünü güncelleme (sadece admin)

// Tüm kullanıcıları listeleme ve silme (sadece admin)
router
  .use(isAdmin)
  .route("/")
  .get(getAllUserFromDatabase)
  .delete(deleteAllUsersFromDatabase);

module.exports = router;
