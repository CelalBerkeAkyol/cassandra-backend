const Image = require("../Models/ImageSchema");

// Çoklu görsel yükleme (altText zorunlu değil)
exports.uploadImages = async (req, res) => {
  console.info("image/uploadImages: Görsel yükleme işlemi başladı.");
  try {
    if (!req.files || req.files.length === 0) {
      console.warn("image/uploadImages: Görsel dosyası bulunamadı.");
      return res
        .status(400)
        .json({ success: false, message: "Görsel dosyası bulunamadı." });
    }

    const uploadedImages = [];
    const altText = req.body.altText || "";

    for (const file of req.files) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;
      const image = new Image({
        url: imageUrl,
        filename: file.filename,
        altText: altText,
      });

      await image.save();
      uploadedImages.push(image);
    }

    console.info(
      `image/uploadImages: ${uploadedImages.length} görsel başarıyla yüklendi.`
    );
    return res.status(201).json({
      success: true,
      message: "Görseller başarıyla yüklendi.",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("image/uploadImages hata:", error);
    return res.status(500).json({
      success: false,
      message: "Görseller yüklenirken bir hata oluştu.",
      error: error.message,
    });
  }
};

// Görselleri sayfalama ile listeleme
exports.getImages = async (req, res) => {
  console.info("image/getImages: Görseller listeleniyor.");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const images = await Image.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments();
    const totalPages = Math.ceil(total / limit);

    console.info(`image/getImages: ${images.length} görsel listelendi.`);
    return res.status(200).json({
      success: true,
      message: "Görseller başarıyla listelendi.",
      images,
      page,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("image/getImages hata:", error);
    return res.status(500).json({
      success: false,
      message: "Görseller listelenirken bir hata oluştu.",
      error: error.message,
    });
  }
};

// Görsel silme
exports.deleteImage = async (req, res) => {
  console.info("image/deleteImage: Görsel silme işlemi başladı.");
  try {
    const { id } = req.params;
    const deletedImage = await Image.findByIdAndDelete(id);

    if (!deletedImage) {
      console.warn(`image/deleteImage: ID ${id} ile görsel bulunamadı.`);
      return res
        .status(404)
        .json({ success: false, message: "Bu ID'li görsel bulunamadı." });
    }

    console.info(`image/deleteImage: ID ${id} ile görsel başarıyla silindi.`);
    return res.status(200).json({
      success: true,
      message: "Görsel başarıyla silindi.",
      image: deletedImage,
    });
  } catch (error) {
    console.error("image/deleteImage hata:", error);
    return res.status(500).json({
      success: false,
      message: "Görsel silinirken bir hata oluştu.",
      error: error.message,
    });
  }
};
