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

module.exports = { getAccessTokenFromHeader };
