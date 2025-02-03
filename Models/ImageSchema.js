const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Lütfen resim URL'si giriniz"],
    },
    altText: {
      type: String,
      required: [true, "Lütfen resim açıklaması giriniz"],
    },
    // Blog yazısı ile ilişki kaldırıldı.
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
