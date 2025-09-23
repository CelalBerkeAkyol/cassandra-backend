const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const Image = require("../Models/ImageSchema");

/**
 * Markdown içindeki image URL'lerini tespit eder
 * @param {string} markdownContent - Markdown içeriği
 * @returns {Array} Image URL'leri dizisi
 */
const extractImageUrls = (markdownContent) => {
  // Markdown image pattern: ![alt text](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdownContent)) !== null) {
    const altText = match[1] || "";
    const url = match[2];

    // Sadece HTTP/HTTPS URL'lerini işle (base64 vb. hariç)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      images.push({
        altText,
        url,
        originalMatch: match[0],
      });
    }
  }

  return images;
};

/**
 * URL'den image indirir ve buffer olarak döner
 * @param {string} url - Image URL'i
 * @returns {Promise<Buffer>} Image buffer'ı
 */
const downloadImageFromUrl = async (url) => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
      timeout: 30000, // 30 saniye timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Image download failed for URL: ${url}`, error.message);
    throw new Error(`Image download failed: ${error.message}`);
  }
};

/**
 * Image'ı optimize eder ve boyutunu ayarlar
 * @param {Buffer} imageBuffer - Orijinal image buffer'ı
 * @param {string} mimeType - Image MIME type'ı
 * @returns {Promise<Buffer>} Optimize edilmiş image buffer'ı
 */
const optimizeImage = async (imageBuffer, mimeType) => {
  try {
    let sharpInstance = sharp(imageBuffer);

    // Metadata'yı al
    const metadata = await sharpInstance.metadata();

    // Büyük image'ları yeniden boyutlandır (max 1920px genişlik)
    if (metadata.width > 1920) {
      sharpInstance = sharpInstance.resize(1920, null, {
        withoutEnlargement: true,
        fit: "inside",
      });
    }

    // Format'a göre optimize et
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      return await sharpInstance
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } else if (mimeType.includes("png")) {
      return await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
    } else if (mimeType.includes("webp")) {
      return await sharpInstance.webp({ quality: 85 }).toBuffer();
    } else {
      // Desteklenmeyen format'ları JPEG'e çevir
      return await sharpInstance
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    }
  } catch (error) {
    console.error("Image optimization failed:", error.message);
    // Optimize edilemezse orijinal buffer'ı döndür
    return imageBuffer;
  }
};

/**
 * URL'den image'ı indirir, optimize eder ve veritabanına kaydeder
 * @param {string} imageUrl - Image URL'i
 * @param {string} altText - Alt text
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} req - Request objesi (URL oluşturmak için)
 * @returns {Promise<object>} Kaydedilen image bilgileri
 */
const processAndSaveImage = async (imageUrl, altText, userId, req) => {
  try {
    // Image'ı indir
    const imageBuffer = await downloadImageFromUrl(imageUrl);

    // MIME type'ını tespit et
    const mimeType = await detectMimeType(imageBuffer);

    // Image'ı optimize et
    const optimizedBuffer = await optimizeImage(imageBuffer, mimeType);

    // Filename oluştur
    const urlParts = new URL(imageUrl);
    const originalName = path.basename(urlParts.pathname) || "imported-image";
    const filename = `${Date.now()}-imported-${originalName.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    // Veritabanına kaydet
    const image = new Image({
      filename,
      altText: altText || "Imported image",
      uploadedBy: userId,
      data: optimizedBuffer,
      contentType: mimeType,
      originalUrl: imageUrl, // Orijinal URL'yi de sakla
      isImported: true, // Import edildi olarak işaretle
    });

    // Path'i ayarla
    image.path = `/api/images/${image._id}`;

    // Use absolute URL based on environment
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      image.url = `http://api.cassandra.com.tr${image.path}`;
    } else {
      image.url = `${req.protocol}://${req.get("host")}${image.path}`;
    }

    await image.save();

    return {
      _id: image._id,
      path: image.path,
      url: image.url,
      filename: image.filename,
      altText: image.altText,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error(
      `Failed to process image from URL: ${imageUrl}`,
      error.message
    );
    throw error;
  }
};

/**
 * Buffer'dan MIME type'ını tespit eder
 * @param {Buffer} buffer - Image buffer'ı
 * @returns {Promise<string>} MIME type
 */
const detectMimeType = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    switch (metadata.format) {
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      default:
        return "image/jpeg"; // Default olarak JPEG
    }
  } catch (error) {
    console.error("MIME type detection failed:", error.message);
    return "image/jpeg"; // Hata durumunda default JPEG
  }
};

/**
 * Blog post içeriğindeki external image'ları işler ve local'e taşır
 * @param {string} markdownContent - Markdown içeriği
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} req - Request objesi
 * @returns {Promise<object>} Güncellenmiş markdown ve işlenen image'lar
 */
const processPostImages = async (markdownContent, userId, req) => {
  try {
    // Markdown'daki image URL'lerini bul
    const extractedImages = extractImageUrls(markdownContent);

    if (extractedImages.length === 0) {
      return {
        updatedContent: markdownContent,
        processedImages: [],
        errors: [],
      };
    }

    console.log(`Found ${extractedImages.length} external images to process`);

    const processedImages = [];
    const errors = [];
    let updatedContent = markdownContent;

    // Her image'ı sırayla işle
    for (const imageData of extractedImages) {
      try {
        console.log(`Processing image: ${imageData.url}`);

        // Image'ı indir ve kaydet
        const savedImage = await processAndSaveImage(
          imageData.url,
          imageData.altText,
          userId,
          req
        );

        // Markdown'daki URL'yi güncelle - tam URL kullan
        // Ensure we're using the absolute URL with domain (savedImage.url already has the full URL)
        const newMarkdown = `![${imageData.altText}](${savedImage.url})`;
        updatedContent = updatedContent.replace(
          imageData.originalMatch,
          newMarkdown
        );

        processedImages.push(savedImage);
        console.log(
          `Successfully processed image: ${imageData.url} -> ${savedImage.url}`
        );
      } catch (error) {
        console.error(
          `Failed to process image: ${imageData.url}`,
          error.message
        );
        errors.push({
          url: imageData.url,
          error: error.message,
        });
      }
    }

    return {
      updatedContent,
      processedImages,
      errors,
    };
  } catch (error) {
    console.error("Image processing failed:", error.message);
    throw error;
  }
};

module.exports = {
  extractImageUrls,
  downloadImageFromUrl,
  optimizeImage,
  processAndSaveImage,
  processPostImages,
  detectMimeType,
};
