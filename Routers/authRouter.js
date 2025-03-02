//auth rotasına gidildiğinde kullanıcı yetkili mi sorgulayacak
const express = require("express");
const router = express.Router();
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");

const {
  login,
  createUser,
  refreshAccessToken,
  verifyToken,
  logout,
  register,
} = require("../controllers/authController"); // token burada oluşturuluyor

// admin tarafından post isteği ile veri tabanına kullanıcı ekleme
router.post("/create-user", getAccessToRoute, isAdmin, createUser);
router.post("/register", register);

router.post("/login", login);
router.post("/logout", getAccessToRoute, logout);

// buraya refresh işlemleri atılacak
router.post("/refresh-token", getAccessToRoute, refreshAccessToken);
router.post("/verify-token", verifyToken);

// Admin route'u, önce token doğrulaması yapılır, sonra admin kontrolü
router.get("/admin", getAccessToRoute, isAdmin, (req, res) => {
  res.send("Welcome Admin! You have access.");
});

module.exports = router;
