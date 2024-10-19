const sanitizeHtml = require("sanitize-html");

const sanitizePostContent = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content);
  }

  next();
};

module.exports = { sanitizePostContent };
