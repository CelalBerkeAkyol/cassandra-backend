const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/";

// Dosya kaydedilmeden önce klasörün varlığını kontrol edip oluşturuyoruz.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Örneğin: 1672531234567-originalName.jpg
    cb(null, Date.now() + "-" + file.originalname);
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
