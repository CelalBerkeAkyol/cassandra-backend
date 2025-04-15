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

  // Environment kontrolü
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Cookie ayarları - Cross-site uyumlu
  const cookieOptions = {
    httpOnly: true,
    secure: !isDevelopment, // Production'da true, development'ta false
    sameSite: isDevelopment ? "Lax" : "None", // Development'ta Lax, Production'da None
    path: "/",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

module.exports = { getAccessTokenFromHeader, clearAuthCookies };
