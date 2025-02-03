// routes/imageRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const imageController = require("../controllers/imageController");

// Tek bir görsel yüklemek için "image" alanı üzerinden dosya alıyoruz.
router.post("/", upload.single("image"), imageController.uploadImage);

module.exports = router;
