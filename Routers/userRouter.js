const express = require("express");
const router = express.Router();
const {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,
  getUserByUserNameFromDatabase,
  deleteUserFromDatabase,
} = require("../controllers/userController.js");
const {
  getAccessToRoute,
  isAdmin,
} = require("../middlewares/authMiddleware.js"); // kullanıcı kontrolü burada yapılıyor

// Ortak yol prefix'i kullanılarak rotalar birleştirildi
router.use(getAccessToRoute); // Tüm rotalarda erişim kontrolü
router.get("/:username", isAdmin, getUserByUserNameFromDatabase); // Belirli kullanıcıyı getirme (sadece admin)
router.delete("/:username", isAdmin, deleteUserFromDatabase); // Belirli kullanıcıyı silme (sadece admin)
router
  .route("/")
  .get(getAllUserFromDatabase) // Tüm kullanıcıları listeleme (sadece admin)
  .post(deleteAllUsersFromDatabase); // Tüm kullanıcıları silme (sadece admin)
router.route("/:id").put(isAdmin, updateUserFromDatabase); // Kullanıcı güncelleme (sadece admin)

module.exports = router;
