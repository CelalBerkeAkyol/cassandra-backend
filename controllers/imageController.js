const Image = require("../Models/ImageSchema");
const { processAndSaveImage } = require("../Helpers/imageProcessingHelpers");
const {
  processJupyterFolder,
  extractZipFile,
  cleanupTempFolder,
} = require("../Helpers/jupyterProcessingHelpers");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
    return res.status(200).json({
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

/**
 * Tek URL'den görsel import etme
 * POST /api/images/import-url
 */
const importImageFromUrl = async (req, res) => {
  console.info(
    "image/importImageFromUrl: URL'den görsel import işlemi başladı."
  );
  try {
    const { imageUrl, altText } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL gereklidir",
        error: {
          code: "MISSING_URL",
          details: ["imageUrl parametresi gereklidir."],
        },
      });
    }

    // URL formatını kontrol et
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz URL formatı",
        error: {
          code: "INVALID_URL",
          details: ["Sadece HTTP/HTTPS URL'leri desteklenir."],
        },
      });
    }

    const userId = req.user.id;

    // URL'den image'ı import et
    const importedImage = await processAndSaveImage(
      imageUrl,
      altText,
      userId,
      req
    );

    console.info(
      `image/importImageFromUrl: Görsel başarıyla import edildi: ${imageUrl}`
    );
    return res.status(201).json({
      success: true,
      message: "Görsel başarıyla import edildi",
      data: importedImage,
    });
  } catch (error) {
    console.error("image/importImageFromUrl hata:", error);
    return res.status(500).json({
      success: false,
      message: "Görsel import edilirken hata oluştu",
      error: {
        code: "IMPORT_ERROR",
        details: [error.message],
      },
    });
  }
};

/**
 * Çoklu URL'den görsel import etme
 * POST /api/images/import-bulk
 */
const importImagesFromUrls = async (req, res) => {
  console.info(
    "image/importImagesFromUrls: Toplu görsel import işlemi başladı."
  );
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image URL dizisi gereklidir",
        error: {
          code: "MISSING_URLS",
          details: ["imageUrls dizisi gereklidir ve boş olamaz."],
        },
      });
    }

    const userId = req.user.id;
    const results = {
      successful: [],
      failed: [],
    };

    // Her URL'yi sırayla işle
    for (const urlData of imageUrls) {
      try {
        const imageUrl = typeof urlData === "string" ? urlData : urlData.url;
        const altText = typeof urlData === "object" ? urlData.altText : "";

        if (
          !imageUrl ||
          (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
        ) {
          results.failed.push({
            url: imageUrl,
            error: "Geçersiz URL formatı",
          });
          continue;
        }

        const importedImage = await processAndSaveImage(
          imageUrl,
          altText,
          userId,
          req
        );
        results.successful.push(importedImage);
      } catch (error) {
        results.failed.push({
          url: typeof urlData === "string" ? urlData : urlData.url,
          error: error.message,
        });
      }
    }

    console.info(
      `image/importImagesFromUrls: ${results.successful.length} görsel başarılı, ${results.failed.length} hata.`
    );
    return res.status(200).json({
      success: true,
      message: `${results.successful.length} görsel başarıyla import edildi`,
      data: results,
    });
  } catch (error) {
    console.error("image/importImagesFromUrls hata:", error);
    return res.status(500).json({
      success: false,
      message: "Toplu import işleminde hata oluştu",
      error: {
        code: "BULK_IMPORT_ERROR",
        details: [error.message],
      },
    });
  }
};

/**
 * Local dosyalardan çoklu görsel yükleme
 * POST /api/images/upload-local
 */
const uploadLocalImages = async (req, res) => {
  console.info(
    "image/uploadLocalImages: Local dosyalardan görsel yükleme işlemi başladı."
  );
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

    const userId = req.user.id;
    const uploadedImages = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Orijinal dosya adını güvenli hâle getir
        const filename = `${Date.now()}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        // Görsel verisini kaydet
        const image = new Image({
          filename,
          altText: req.body.altText || file.originalname,
          uploadedBy: userId,
          data: file.buffer,
          contentType: file.mimetype,
          isImported: false, // Local upload olarak işaretle
        });

        // Dinamik yol: /api/images/<id>
        image.path = `/api/images/${image._id}`;
        await image.save();

        uploadedImages.push({
          _id: image._id,
          path: image.path,
          url: makeFullUrl(req, image.path),
          filename: image.filename,
          altText: image.altText,
          originalName: file.originalname,
          uploadedBy: image.uploadedBy,
          createdAt: image.createdAt,
        });
      } catch (error) {
        console.error(
          `Local image upload failed for ${file.originalname}:`,
          error
        );
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    console.info(
      `image/uploadLocalImages: ${uploadedImages.length} görsel başarıyla yüklendi, ${errors.length} hata.`
    );

    return res.status(201).json({
      success: true,
      message: `${uploadedImages.length} görsel başarıyla yüklendi`,
      data: {
        uploaded: uploadedImages,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("image/uploadLocalImages hata:", error);
    return res.status(500).json({
      success: false,
      message: "Local görsel yükleme hatası",
      error: {
        code: "LOCAL_UPLOAD_ERROR",
        details: [error.message],
      },
    });
  }
};

/**
 * Jupyter notebook ZIP dosyası upload ve processing
 * POST /api/images/upload-jupyter-zip
 */
const uploadJupyterZip = async (req, res) => {
  console.info("image/uploadJupyterZip: Jupyter ZIP dosyası işleme başladı.");

  let tempDir = null;
  let extractDir = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ZIP dosyası bulunamadı",
        error: {
          code: "NO_ZIP_FILE",
          details: ["Yüklenecek ZIP dosyası bulunamadı."],
        },
      });
    }

    const userId = req.user.id;

    // Geçici dizin oluştur
    tempDir = path.join(
      os.tmpdir(),
      `jupyter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
    extractDir = path.join(tempDir, "extracted");

    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(extractDir, { recursive: true });

    // ZIP dosyasını geçici dizine kaydet
    const zipPath = path.join(tempDir, "upload.zip");
    fs.writeFileSync(zipPath, req.file.buffer);

    console.log(`ZIP saved to: ${zipPath}`);

    // ZIP'i extract et
    await extractZipFile(zipPath, extractDir);

    // Extract edilen klasörün içeriğini kontrol et
    const extractedContents = fs.readdirSync(extractDir);
    console.log(`Extracted contents:`, extractedContents);

    // Eğer tek bir klasör varsa, onun içine gir
    let workingDir = extractDir;
    if (
      extractedContents.length === 1 &&
      fs.statSync(path.join(extractDir, extractedContents[0])).isDirectory()
    ) {
      workingDir = path.join(extractDir, extractedContents[0]);
      console.log(`Working in subdirectory: ${workingDir}`);
    }

    // Jupyter klasörünü işle
    const result = await processJupyterFolder(workingDir, userId, req);

    console.info(
      `image/uploadJupyterZip: İşlem tamamlandı. ${result.successfulUploads}/${result.totalImages} görsel yüklendi.`
    );

    // Sonucu döndür
    res.status(200).json({
      success: true,
      message: `Jupyter notebook işlendi. ${result.successfulUploads} görsel yüklendi.`,
      data: result,
    });
  } catch (error) {
    console.error("image/uploadJupyterZip hata:", error);
    res.status(500).json({
      success: false,
      message: "Jupyter ZIP işleme hatası",
      error: {
        code: "JUPYTER_PROCESSING_ERROR",
        details: [error.message],
      },
    });
  } finally {
    // Temizlik
    if (tempDir) {
      setTimeout(() => cleanupTempFolder(tempDir), 5000); // 5 saniye sonra temizle
    }
  }
};

/**
 * Jupyter notebook klasör upload (multipart/form-data)
 * POST /api/images/upload-jupyter-folder
 */
const uploadJupyterFolder = async (req, res) => {
  console.info(
    "image/uploadJupyterFolder: Jupyter klasör upload işlemi başladı."
  );

  let tempDir = null;

  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "Klasör dosyaları bulunamadı",
        error: {
          code: "NO_FOLDER_FILES",
          details: ["Yüklenecek klasör dosyaları bulunamadı."],
        },
      });
    }

    const userId = req.user.id;

    // Geçici dizin oluştur
    tempDir = path.join(
      os.tmpdir(),
      `jupyter-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
    fs.mkdirSync(tempDir, { recursive: true });

    // Dosyaları geçici dizine kaydet
    for (const file of req.files) {
      const filePath = path.join(tempDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
    }

    console.log(`Folder files saved to: ${tempDir}`);
    console.log(`Files: ${req.files.map((f) => f.originalname).join(", ")}`);

    // Jupyter klasörünü işle
    const result = await processJupyterFolder(tempDir, userId, req);

    console.info(
      `image/uploadJupyterFolder: İşlem tamamlandı. ${result.successfulUploads}/${result.totalImages} görsel yüklendi.`
    );

    // Sonucu döndür
    res.status(200).json({
      success: true,
      message: `Jupyter notebook işlendi. ${result.successfulUploads} görsel yüklendi.`,
      data: result,
    });
  } catch (error) {
    console.error("image/uploadJupyterFolder hata:", error);
    res.status(500).json({
      success: false,
      message: "Jupyter klasör işleme hatası",
      error: {
        code: "JUPYTER_FOLDER_ERROR",
        details: [error.message],
      },
    });
  } finally {
    // Temizlik
    if (tempDir) {
      setTimeout(() => cleanupTempFolder(tempDir), 5000);
    }
  }
};

module.exports = {
  uploadImages,
  getImages,
  deleteImage,
  viewImage,
  importImageFromUrl,
  importImagesFromUrls,
  uploadLocalImages,
  uploadJupyterZip,
  uploadJupyterFolder,
};
