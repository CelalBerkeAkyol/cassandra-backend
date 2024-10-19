const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, "Lütfen resim URL'si giriniz"], // Uyarı metni ekleme
  },
  altText: {
    type: String,
    required: [true, "Lütfen resim açıklaması giriniz"], // Uyarı metni ekleme
  },
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true, // Her resim bir blog yazısına bağlı olmalı
  },
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
