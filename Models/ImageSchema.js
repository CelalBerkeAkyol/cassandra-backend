const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Lütfen resim URL'si giriniz"],
    },
    filename: {
      type: String,
      required: [true, "Dosya adı eksik"], // Dosya isminin kaydedilmesini zorunlu yaptık
    },
    altText: {
      type: String,
    },
    // Yükleyen kullanıcı bilgisi
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Blog yazısı ile ilişki kaldırıldı.
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
