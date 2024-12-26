// /controllers/authController.js
// bu controller kullanıcıların
// giriş yapmasını ve üye olmasını sağlıyor. Sisteme giren kullanıcılar için token oluşturuyor
// register işlemi sadece admin tarafından yapılabiliyor
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserSchema"); // User bir colleciton

// Token oluşturma
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, username: user.userName, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m", // Access Token kısa süreli olmalı
    }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // Refresh Token daha uzun süreli
    }
  );

  return { accessToken, refreshToken };
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ userName: username });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Geçersiz şifre" });

    const { accessToken, refreshToken } = generateTokens(user);
    // Refresh Token'ı veritabanında sakla
    user.refreshToken = refreshToken;
    await user.save();

    // Token'i cookie'ye ekle
    res.cookie("token", accessToken, {
      httpOnly: true,

      maxAge: 24 * 60 * 60 * 1000, // 1 gün
    });
    // TODO token döndürmeyi sonrasında sil
    res.status(200).json({ message: "Giriş başarılı" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
// register yerine geçecek bir controller diyebiliriz
const createUser = async (req, res, next) => {
  const { userName, password } = req.body;

  try {
    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email ile kayıtlı bir kullanıcı zaten var." });
    }

    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      userName,
      password,
    });

    res.status(201).json({
      message: "Yeni kullanıcı başarıyla oluşturuldu.",
      user: newUser.userName,
    });
  } catch (error) {
    return next(error);
  }
};
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies; // Refresh Token Cookie'den alınır

  if (!refreshToken)
    return res.status(401).json({ message: "Yetkilendirme yok." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Veritabanından Refresh Token kontrolü
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user)
      return res.status(403).json({ message: "Geçersiz Refresh Token." });

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.status(200).json({ message: "Yeni Access Token oluşturuldu." });
  } catch (error) {
    res
      .status(403)
      .json({ message: "Geçersiz veya süresi dolmuş Refresh Token." });
  }
};
const logout = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    user.refreshToken = null;
    await user.save();

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Çıkış yapıldı." });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

module.exports = {
  login,
  createUser,
  refreshAccessToken,
  logout,
};
