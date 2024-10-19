const express = require("express");
const router = express.Router();
const {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,
  getUserByIDFromDatabase,
  deleteUserFromDatabase,
} = require("../controllers/userController.js");
const {
  getAccessToRoute,
  isAdmin,
} = require("../middlewares/authMiddleware.js"); // kullanıcı kontrolü burada yapılıyor

// ---> / ile belirtilen route {{url}}/api/user

// tüm userları çekme
// TO-DO burayı adminlere açık tut veya bunu tamamen sil güvenlik problemi yaratır
router.get("/", getAllUserFromDatabase);

// bir kişiyi çekme
// TO-DO burayı adminlere açık tut veya bunu tamamen sil güvenlik problemi yaratır
router.get("/:id", getUserByIDFromDatabase);

// bir kullanıcı güncelleme
router.put("/:id", getAccessToRoute, isAdmin, updateUserFromDatabase);

// bir kişi silenecek
router.delete("/:id", getAccessToRoute, isAdmin, deleteUserFromDatabase);

// tüm kulllanıcıları silme
router.post(
  "/delete-all-users",
  getAccessToRoute,
  isAdmin,
  deleteAllUsersFromDatabase
);

module.exports = router;
