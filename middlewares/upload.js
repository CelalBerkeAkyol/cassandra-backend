// middleware/upload.js
const multer = require("multer");

// Artık dosyaları diske kaydetmek yerine belleğe alıyoruz
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Sadece görsel dosyalar yüklenebilir!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit koyduk
  fileFilter: fileFilter,
});

module.exports = upload;
