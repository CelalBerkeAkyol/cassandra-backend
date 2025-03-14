// /middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const getAccessToRoute = (req, res, next) => {
  const access_token = req.cookies.token;
  if (!access_token) {
    console.error("getAccessToRoute: Token bulunamadı.");
    return res.status(403).json({
      success: false,
      message: "Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.",
      error: {
        code: "AUTH_REQUIRED",
        details: ["Oturum açmanız gerekiyor."],
      },
    });
  }
  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    req.user = decoded;
    console.info("getAccessToRoute: Token doğrulandı.");
    return next();
  } catch (err) {
    console.error("getAccessToRoute: Geçersiz token.", err);
    return res.status(401).json({
      success: false,
      message: "Oturumunuz sona ermiş olabilir.",
      error: {
        code: "INVALID_TOKEN",
        details: ["Lütfen tekrar giriş yapın."],
      },
    });
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
    return res.status(403).json({
      success: false,
      message:
        "Bu işlemi gerçekleştirmek için admin yetkisine sahip olmanız gerekiyor.",
      error: {
        code: "ADMIN_REQUIRED",
        details: ["Sadece admin kullanıcılar bu işlemi gerçekleştirebilir."],
      },
    });
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
    return res.status(403).json({
      success: false,
      message:
        "Bu işlemi gerçekleştirmek için yazar yetkisine sahip olmanız gerekiyor.",
      error: {
        code: "AUTHOR_REQUIRED",
        details: ["Sadece yazar kullanıcılar bu işlemi gerçekleştirebilir."],
      },
    });
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
    return res.status(403).json({
      success: false,
      message:
        "Bu işlemi gerçekleştirmek için yazar veya admin yetkisine sahip olmanız gerekiyor.",
      error: {
        code: "AUTHOR_OR_ADMIN_REQUIRED",
        details: [
          "Sadece yazar veya admin kullanıcılar bu işlemi gerçekleştirebilir.",
        ],
      },
    });
  }
};

// İçerik sahibi veya admin kontrolü
const isOwnerOrAdmin = (req, res, next) => {
  const userRole = req.user.role;
  const userId = req.user.id;
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
  return res.status(403).json({
    success: false,
    message:
      "Bu içeriği sadece içerik sahibi veya admin düzenleyebilir/silebilir.",
    error: {
      code: "OWNER_OR_ADMIN_REQUIRED",
      details: ["İçeriği düzenlemek veya silmek için yetkiniz bulunmuyor."],
    },
  });
};

// Kullanıcı işlemleri için sahiplik veya admin kontrolü
const isOwnerOrAdminForUser = (req, res, next) => {
  const userRole = req.user.role;
  const userId = req.user.id;
  const targetUserId = req.params.id;

  // Admin her türlü erişebilir
  if (userRole === "admin") {
    console.info("isOwnerOrAdminForUser: Admin yetkisi doğrulandı.");
    return next();
  }

  // Kullanıcı kendi bilgilerine erişebilir
  if (userId === targetUserId) {
    console.info(
      "isOwnerOrAdminForUser: Kullanıcı kendi bilgilerine erişiyor."
    );
    return next();
  }

  console.error(
    "isOwnerOrAdminForUser: Yetkisiz erişim, kendi bilgileriniz veya admin değilsiniz."
  );
  return res.status(403).json({
    success: false,
    message: "Kullanıcı bilgilerini sadece kendisi veya admin düzenleyebilir.",
    error: {
      code: "USER_OWNER_OR_ADMIN_REQUIRED",
      details: ["Kullanıcı bilgilerini düzenlemek için yetkiniz bulunmuyor."],
    },
  });
};

module.exports = {
  getAccessToRoute,
  isAdmin,
  isAuthor,
  isAuthorOrAdmin,
  isOwnerOrAdmin,
  isOwnerOrAdminForUser,
};
