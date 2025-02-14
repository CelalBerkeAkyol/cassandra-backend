const Image = require("../Models/ImageSchema");

// Çoklu görsel yükleme (altText zorunlu değil)
exports.uploadImages = async (req, res) => {
  try {
    // Çoklu dosya gönderildiğinde multer tarafından req.files dolacaktır.
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Görsel dosyası bulunamadı." });
    }

    const uploadedImages = [];

    // Alt metin (altText) tek bir alan olarak geliyorsa veya
    // her dosya için ayrı altText dizi halinde gelebiliyorsa buna göre uyarlayın.
    // Burada sadece tek bir altText varsa varsayılan değeri boş string yapıyoruz.
    const altText = req.body.altText || "";

    for (const file of req.files) {
      // Her dosya için URL oluşturuluyor
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;

      // Model örneği oluşturup veritabanına kaydediyoruz
      const image = new Image({
        url: imageUrl,
        filename: file.filename,
        altText: altText, // altText boş da olabilir
      });
      await image.save();
      uploadedImages.push(image);
    }

    return res.status(201).json({
      message: "Görseller başarıyla yüklendi.",
      images: uploadedImages,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// (İsterseniz tekli yükleme fonksiyonunu da tamamen kaldırabilir veya düzenleyebilirsiniz)
// exports.uploadImage = ...

// Görselleri sayfalama ile listeleme
exports.getImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    // Varsayılan olarak 9 görselde bir sonraki sayfaya geçecek
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // En son eklenenleri üstte göstermek için createdAt alanına göre sıralıyoruz
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      images,
      page,
      totalPages,
      total,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await Image.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({ error: "Bu ID'li görsel bulunamadı." });
    }

    return res.json({
      message: "Görsel başarıyla silindi.",
      image: deletedImage,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
