const express = require("express");
const router = express.Router();
const {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,

  getUserByID,
  deleteUserByID,
  updateUserRole,
} = require("../controllers/userController.js");
const {
  getAccessToRoute,
  isAdmin,
  isAuthorOrAdmin,
} = require("../middlewares/authMiddleware.js"); // kullanıcı kontrolü burada yapılıyor

// Ortak yol prefix'i kullanılarak rotalar birleştirildi
router.use(getAccessToRoute); // Tüm rotalarda erişim kontrolü

// Kullanıcı bilgisi getirme - giriş yapmış herkes erişebilir
router.get("/:id", getUserByID);

// Kullanıcı güncelleme - kullanıcının kendisi veya admin yapabilir
// Not: Burada isOwnerOrAdmin benzeri bir middleware kullanılabilir
router.route("/:id").put(updateUserFromDatabase);

// Sadece admin erişebilen rotalar
router.delete("/:id", isAdmin, deleteUserByID); // Belirli kullanıcıyı silme (sadece admin)
router.patch("/:id/role", isAdmin, updateUserRole); // Kullanıcı rolünü güncelleme (sadece admin)

// Tüm kullanıcıları listeleme ve silme (sadece admin)
router
  .use(isAdmin)
  .route("/")
  .get(getAllUserFromDatabase)
  .delete(deleteAllUsersFromDatabase);

module.exports = router;
