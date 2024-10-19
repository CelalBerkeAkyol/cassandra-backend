const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchema"); // User bir colleciton

// header kısmındaki access_tokeni almaya yarayan fonksiyon
const getAccessTokenFromHeader = (req) => {
  const authorization = req.headers["authorization"];
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }
  return null;
};

// user req body içerisindeki bilgiler ile
const access_token_creater = (user_information) => {
  console.log("access_token_creater çalıştı ");
  const { _id, userName, email, role } = user_information;
  // token üzerinde saklanacak veri userPayload
  const userPayload = {
    _id,
    userName,
    email,
    role,
  };

  return (accessToken = jwt.sign(userPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_SECRET_KEY_EXPIRES_IN,
  }));
  // oluşturulan access token'in cookie veya headers üzerinde saklanması gerekiyor
};

module.exports = {
  getAccessTokenFromHeader,

  access_token_creater,
};
