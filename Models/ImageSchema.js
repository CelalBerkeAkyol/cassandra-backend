const mongoose = require("mongoose");

/**
 * Tek gerçek alan `path`.
 * Tam URL (host + protokol) çalışma sırasında controller
 * içinde üretildiği için veritabanında saklamaya gerek yok.
 * İstersen convenience amaçlı sanal (virtual) bir `url` alanı
 * ekliyoruz; ancak REQUIRED DEĞİL.
 */
const imageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, "Görselin erişim yolu (path) eksik"],
    },
    filename: {
      type: String,
      required: [true, "Dosya adı eksik"],
    },
    altText: { type: String },
    data: {
      type: Buffer,
      required: [true, "Resim verisi eksik"],
    },
    contentType: {
      type: String,
      required: [true, "Resim içerik tipi eksik"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Sanal alan: tam URL (runtime'da controller veya client tarafından doldurulur)
imageSchema.virtual("url").get(function () {
  return this.path; // Öntanımlı – controller tam URL ile değiştirecek
});

module.exports = mongoose.model("Image", imageSchema);
