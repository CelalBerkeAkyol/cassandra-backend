// /middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { getAccessTokenFromHeader } = require("../Helpers/tokenHelpers");

// Routa erişme izni veren fonksiyon
const getAccessToRoute = (req, res, next) => {
  // header kısmından access_token alınır
  const access_token = getAccessTokenFromHeader(req);
  // access_token bulunmuyorsa aşağıdaki hata gönderilir
  if (!access_token) {
    return res
      .status(403)
      .send(
        "A token is required for authentication. Probably you are not a user "
      );
  }
  try {
    // kullanıcı verileri decoded içerisinde saklanıyor.
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET_KEY); // Bu da .env dosyasından alınmalı
    req.user = decoded;
    return next(); // herhangi bir response yok diğer isteğe geçiyor
  } catch (err) {
    // token hatalı ise geçersiz token hatası döndürülüyor
    return res.status(401).send("Invalid Token");
  }
};
const isAdmin = (req, res, next) => {
  const userRole = req.user.role; // req.user'dan rolü alın

  if (userRole === "admin") {
    return next(); // Yetki varsa, bir sonraki middleware'e geç
  } else {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }
};
module.exports = { getAccessToRoute, isAdmin };
