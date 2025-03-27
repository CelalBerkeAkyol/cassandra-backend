const Image = require("../Models/ImageSchema");

// Çoklu görsel yükleme (altText zorunlu değil)
const uploadImages = async (req, res) => {
  console.info("image/uploadImages: Görsel yükleme işlemi başladı.");
  try {
    if (!req.files || req.files.length === 0) {
      console.warn("image/uploadImages: Görsel dosyası bulunamadı.");
      return res.status(400).json({
        success: false,
        message: "Görsel dosyası bulunamadı",
        error: {
          code: "NO_FILES",
          details: ["Yüklenecek görsel dosyası bulunamadı."],
        },
      });
    }

    const uploadedImages = [];
    const altText = req.body.altText || "";
    const userId = req.user.id;

    for (const file of req.files) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;
      const image = new Image({
        url: imageUrl,
        filename: file.filename,
        altText: altText,
        uploadedBy: userId,
      });

      await image.save();
      uploadedImages.push(image);
    }

    console.info(
      `image/uploadImages: ${uploadedImages.length} görsel başarıyla yüklendi.`
    );
    return res.status(201).json({
      success: true,
      message: "Görseller başarıyla yüklendi",
      data: uploadedImages,
    });
  } catch (error) {
    console.error("image/uploadImages hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Görseller yüklenirken bir hata oluştu."],
      },
    });
  }
};

// Görselleri sayfalama ile listeleme
const getImages = async (req, res) => {
  console.info("image/getImages: Görseller listeleniyor.");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
      message: "Görseller başarıyla listelendi",
      data: {
        images,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("image/getImages hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Görseller listelenirken bir hata oluştu."],
      },
    });
  }
};

// Görsel silme
const deleteImage = async (req, res) => {
  console.info("image/deleteImage: Görsel silme işlemi başladı.");
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const image = await Image.findById(id);

    if (!image) {
      console.warn(`image/deleteImage: ID ${id} ile görsel bulunamadı.`);
      return res.status(404).json({
        success: false,
        message: "Görsel bulunamadı",
        error: {
          code: "IMAGE_NOT_FOUND",
          details: ["Bu ID'li görsel bulunamadı."],
        },
      });
    }

    if (
      userRole !== "admin" &&
      image.uploadedBy &&
      image.uploadedBy.toString() !== userId
    ) {
      console.error(
        `image/deleteImage: Yetkisiz silme girişimi, kullanıcı: ${userId}, görsel sahibi: ${image.uploadedBy}`
      );
      return res.status(403).json({
        success: false,
        message: "Bu görseli silme yetkiniz yok",
        error: {
          code: "UNAUTHORIZED",
          details: ["Sadece kendi yüklediğiniz görselleri silebilirsiniz."],
        },
      });
    }

    const deletedImage = await Image.findByIdAndDelete(id);

    console.info(`image/deleteImage: ID ${id} ile görsel başarıyla silindi.`);
    return res.status(200).json({
      success: true,
      message: "Görsel başarıyla silindi",
      data: deletedImage,
    });
  } catch (error) {
    console.error("image/deleteImage hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Görsel silinirken bir hata oluştu."],
      },
    });
  }
};

module.exports = {
  uploadImages,
  getImages,
  deleteImage,
};
