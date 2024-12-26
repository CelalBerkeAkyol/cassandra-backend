const getAccessTokenFromHeader = (req) => {
  // Authorization başlığından token al
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]; // Bearer token
  }

  // Cookie'den token al
  if (req.cookies && req.cookies.token) {
    return req.cookies.token; // HTTP-Only cookie
  }

  // Token bulunamazsa null döndür
  return null;
};

module.exports = { getAccessTokenFromHeader };
