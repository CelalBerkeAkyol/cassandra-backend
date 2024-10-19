//auth rotasına gidildiğinde kullanıcı yetkili mi sorgulayacak
const express = require("express");
const router = express.Router();
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");

const { login, register } = require("../controllers/authController"); // token burada oluşturuluyor
const { getUserByIDFromDatabase } = require("../controllers/userController");

// post isteği ile veri tabanına kullanıcı ekleme
router.post("/register", register);

// get isteği ile veri tabanından spesifik kullanıcıları çekme
router.get("/login/:id", getUserByIDFromDatabase);
router.post("/login", login); // Kullanıcının email ve şifre bilgileiri veri tabanı ile eşleşirse giriş yapar
// buraya refresh işlemleri atılacak

// Admin route'u, önce token doğrulaması yapılır, sonra admin kontrolü
router.get("/admin", getAccessToRoute, isAdmin, (req, res) => {
  res.send("Welcome Admin! You have access.");
});
router.get("/default-user", getAccessToRoute, (req, res) => {
  res.send("Welcome default user! You have access.");
});

module.exports = router;
