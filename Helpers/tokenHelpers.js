// /helpers/getAccessTokenFromHeader.js
const getAccessTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    console.info("getAccessTokenFromHeader: Token header üzerinden alındı.");
    return authHeader.split(" ")[1]; // Bearer token
  }

  if (req.cookies && req.cookies.token) {
    console.info("getAccessTokenFromHeader: Token cookie üzerinden alındı.");
    return req.cookies.token;
  }

  console.warn("getAccessTokenFromHeader: Token bulunamadı.");
  return null;
};

/**
 * Kimlik doğrulama çerezlerini temizler
 * @param {Object} res - Express response objesi
 */
const clearAuthCookies = (res) => {
  console.info("Kimlik doğrulama çerezleri temizleniyor");
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/",
  });
};

module.exports = { getAccessTokenFromHeader, clearAuthCookies };
