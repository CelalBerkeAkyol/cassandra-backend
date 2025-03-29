const express = require("express");
const router = express.Router();
const {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,
  getUserByUserNameFromDatabase,
  getUserByID,
  softDeleteUserByID,
  hardDeleteUserByID,
  updateUserRole,
  getAuthorsAndAdmins,
  toggleUserActivation,
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

// Kullanıcıyı engelleme ve soft delete - sadece admin yapabilir
router
  .route("/:id")
  .put(isOwnerOrAdminForUser, updateUserFromDatabase)
  .delete(isAdmin, cleanupUserData, softDeleteUserByID); // Soft delete - isActive false yapar

// Hard delete -  admin veya kullanıcının kendisi yapabilir
router.delete(
  "/:id/hard",
  isOwnerOrAdminForUser,
  cleanupUserData,
  hardDeleteUserByID
); // Kullanıcıyı veritabanından tamamen siler

// Sadece admin erişebilen rotalar
router.patch("/:id/role", isAdmin, updateUserRole); // Kullanıcı rolünü güncelleme (sadece admin)
router.patch("/:userId/toggle-activation", isAdmin, toggleUserActivation); // Kullanıcı aktivasyon durumunu değiştirme (sadece admin)

// Tüm kullanıcıları listeleme ve silme (sadece admin)
router
  .use(isAdmin)
  .route("/")
  .get(getAllUserFromDatabase)
  .delete(deleteAllUsersFromDatabase);

module.exports = router;
