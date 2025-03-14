// /middlewares/sanitizePostContent.js
const sanitizeHtml = require("sanitize-html");

const sanitizePostContent = (req, res, next) => {
  if (req.body.content) {
    console.info("sanitizePostContent: Post içeriği sanitize ediliyor.");
    req.body.content = sanitizeHtml(req.body.content);
  }
  next();
};

module.exports = { sanitizePostContent };
