const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    path: { type: String, required: true },
    filename: {
      type: String,
      required: [true, "Dosya adı eksik"], // Dosya isminin kaydedilmesini zorunlu yaptık
    },
    altText: {
      type: String,
    },
    // Yeni: Resim verisinin kendisi
    data: {
      type: Buffer,
      required: [true, "Resim verisi eksik"],
    },
    contentType: {
      type: String,
      required: [true, "Resim içerik tipi eksik"],
    },
    // Yükleyen kullanıcı bilgisi
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Otomatik import için orijinal URL
    originalUrl: {
      type: String,
      default: null, // Manuel upload edilen görseller için null
    },
    // Import edilip edilmediğini belirtir
    isImported: {
      type: Boolean,
      default: false,
    },
    // Blog yazısı ile ilişki kaldırıldı.
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
