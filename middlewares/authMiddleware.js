// /middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const getAccessToRoute = (req, res, next) => {
  const access_token = req.cookies.token;
  if (!access_token) {
    console.error("getAccessToRoute: Token bulunamadı.");
    return res
      .status(403)
      .send(
        "A token is required for authentication. Probably you are not a user "
      );
  }
  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user = decoded;
    console.info("getAccessToRoute: Token doğrulandı.");
    return next();
  } catch (err) {
    console.error("getAccessToRoute: Geçersiz token.", err);
    return res.status(401).send("Invalid Token");
  }
};

// Sadece admin rolüne sahip kullanıcılar için middleware
const isAdmin = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole === "admin") {
    console.info("isAdmin: Admin yetkisi doğrulandı.");
    return next();
  } else {
    console.error("isAdmin: Yetkisiz erişim, admin değilsiniz.");
    return res
      .status(403)
      .send(
        "You are not authorized to perform this action. Only admins can access."
      );
  }
};

// Sadece yazar rolüne sahip kullanıcılar için middleware
const isAuthor = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole === "author") {
    console.info("isAuthor: Yazar yetkisi doğrulandı.");
    return next();
  } else {
    console.error("isAuthor: Yetkisiz erişim, yazar değilsiniz.");
    return res
      .status(403)
      .send(
        "You are not authorized to perform this action. Only authors can access."
      );
  }
};

// Yazar veya admin rolüne sahip kullanıcılar için middleware
const isAuthorOrAdmin = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole === "admin" || userRole === "author") {
    console.info("isAuthorOrAdmin: Yazar veya admin yetkisi doğrulandı.");
    return next();
  } else {
    console.error(
      "isAuthorOrAdmin: Yetkisiz erişim, yazar veya admin değilsiniz."
    );
    return res
      .status(403)
      .send(
        "You are not authorized to perform this action. Only authors and admins can access."
      );
  }
};

// İçerik sahibi veya admin kontrolü
const isOwnerOrAdmin = (req, res, next) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  // Post'un author alanı ile kullanıcı ID'sini karşılaştır
  const postAuthorId =
    req.post && req.post.author ? req.post.author.toString() : null;

  // Admin her türlü erişebilir
  if (userRole === "admin") {
    console.info("isOwnerOrAdmin: Admin yetkisi doğrulandı.");
    return next();
  }

  // Yazar sadece kendi içeriğine erişebilir
  if (userRole === "author" && postAuthorId === userId) {
    console.info("isOwnerOrAdmin: İçerik sahibi yetkisi doğrulandı.");
    return next();
  }

  console.error(
    "isOwnerOrAdmin: Yetkisiz erişim, içerik sahibi veya admin değilsiniz."
  );
  return res
    .status(403)
    .send(
      "You are not authorized to perform this action. You can only manage your own content."
    );
};

module.exports = {
  getAccessToRoute,
  isAdmin,
  isAuthor,
  isAuthorOrAdmin,
  isOwnerOrAdmin,
};
