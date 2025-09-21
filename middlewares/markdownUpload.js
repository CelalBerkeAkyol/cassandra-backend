// middleware/markdownUpload.js
const multer = require("multer");

// Bellek storage kullanıyoruz
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Markdown dosyaları ve görselleri kabul et
  if (
    file.mimetype === "text/markdown" ||
    file.mimetype === "text/plain" ||
    file.mimetype === "application/octet-stream" ||
    file.mimetype.startsWith("image/") ||
    file.originalname.endsWith(".md")
  ) {
    cb(null, true);
  } else {
    return cb(
      new Error("Sadece markdown dosyaları ve görseller yüklenebilir!"),
      false
    );
  }
};

const markdownUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (markdown + multiple images)
    files: 50, // Maksimum 50 dosya
  },
  fileFilter: fileFilter,
});

module.exports = markdownUpload;
