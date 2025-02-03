// middleware/upload.js
const multer = require("multer");
const fs = require("fs");

const uploadDir = "uploads/";

// Klasör yoksa oluşturuyoruz
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Boşlukları tire ile değiştiriyoruz:
    const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + sanitizedFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Sadece görsel dosyalar yüklenebilir!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
