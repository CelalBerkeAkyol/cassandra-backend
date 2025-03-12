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
} = require("../middlewares/authMiddleware.js"); // kullanıcı kontrolü burada yapılıyor

// Ortak yol prefix'i kullanılarak rotalar birleştirildi
router.use(getAccessToRoute); // Tüm rotalarda erişim kontrolü
router.get("/:id", getUserByID);
router.delete("/:id", isAdmin, deleteUserByID); // Belirli kullanıcıyı silme (sadece admin)
router.patch("/:id/role", isAdmin, updateUserRole); // Kullanıcı rolünü güncelleme (sadece admin)
router
  .use(isAdmin)
  .route("/")
  .get(getAllUserFromDatabase) // Tüm kullanıcıları listeleme (sadece admin)
  .delete(deleteAllUsersFromDatabase); // Tüm kullanıcıları silme (sadece admin)
router.route("/:id").put(updateUserFromDatabase); // Kullanıcı güncelleme (sadece admin)

module.exports = router;
