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

const isAdmin = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole === "admin") {
    console.info("isAdmin: Admin yetkisi doğrulandı.");
    return next();
  } else {
    console.error("isAdmin: Yetkisiz erişim, admin değilsiniz.");
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }
};

module.exports = { getAccessToRoute, isAdmin };
