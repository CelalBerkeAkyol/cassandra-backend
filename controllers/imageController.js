const Image = require("../Models/ImageSchema");

// Yardımcı: çalışma anında tam URL oluştur
const makeFullUrl = (req, relativePath) =>
  `${req.protocol}://${req.get("host")}${relativePath}`;

/**
 * Çoklu görsel yükleme
 * - İstemci -> POST /api/images (form‑data: image[])
 * - Alt metin opsiyonel → req.body.altText
 * - Her görsel veritabanında kaydedilir; ID'si belli olduktan sonra
 *   path = `/api/images/<id>` şeklinde kurulur.
 */
const uploadImages = async (req, res) => {
  console.info("image/uploadImages: Görsel yükleme işlemi başladı.");
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "Görsel dosyası bulunamadı",
        error: {
          code: "NO_FILES",
          details: ["Yüklenecek görsel dosyası bulunamadı."],
        },
      });
    }

    const altText = req.body.altText || "";
    const userId = req.user.id;
    const uploadedImages = [];

    for (const file of req.files) {
      // Orijinal dosya adını güvenli hâle getir
      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;

      // 1) Doc'u oluştur → _id hemen atanır, böylece önce path'i yazabiliriz
      const image = new Image({
        filename,
        altText,
        uploadedBy: userId,
        data: file.buffer,
        contentType: file.mimetype,
      });

      // 2) Dinamik yol: /api/images/<id>
      image.path = `/api/images/${image._id}`;
      await image.save();

      uploadedImages.push({
        _id: image._id,
        path: image.path,
        url: makeFullUrl(req, image.path),
        filename: image.filename,
        altText: image.altText,
        uploadedBy: image.uploadedBy,
        createdAt: image.createdAt,
      });
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

/**
 * Tek görsel görüntüleme
 * GET /api/images/:id  → binary image
 */
const viewImage = async (req, res) => {
  console.info("image/viewImage: Görsel görüntüleme işlemi başladı.");
  try {
    const { id } = req.params;
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Görsel bulunamadı",
        error: {
          code: "IMAGE_NOT_FOUND",
          details: ["Bu ID'li görsel bulunamadı."],
        },
      });
    }

    res.set("Content-Type", image.contentType);
    return res.send(image.data);
  } catch (error) {
    console.error("image/viewImage hata:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Görsel görüntülenirken bir hata oluştu."],
      },
    });
  }
};

/**
 * Sayfalama ile görselleri listele
 * GET /api/images?page=1&limit=20
 */
const getImages = async (req, res) => {
  console.info("image/getImages: Görseller listeleniyor.");
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const images = await Image.find({}, { data: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const fullImages = images.map((img) => ({
      ...img.toObject(),
      url: makeFullUrl(req, img.path),
    }));

    const total = await Image.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Görseller başarıyla listelendi",
      data: {
        images: fullImages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
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

/**
 * Görsel silme
 * DELETE /api/images/:id
 */
const deleteImage = async (req, res) => {
  console.info("image/deleteImage: Görsel silme işlemi başladı.");
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Görsel bulunamadı",
        error: {
          code: "IMAGE_NOT_FOUND",
          details: ["Bu ID'li görsel bulunamadı."],
        },
      });
    }

    if (userRole !== "admin" && image.uploadedBy?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bu görseli silme yetkiniz yok",
        error: {
          code: "UNAUTHORIZED",
          details: ["Sadece kendi yüklediğiniz görselleri silebilirsiniz."],
        },
      });
    }

    await image.deleteOne();
    return res
      .status(200)
      .json({
        success: true,
        message: "Görsel başarıyla silindi",
        data: image,
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

module.exports = { uploadImages, getImages, deleteImage, viewImage };
