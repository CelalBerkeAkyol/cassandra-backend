const fs = require("fs");
const path = require("path");
const Image = require("../Models/ImageSchema");

/**
 * Markdown dosyasının içeriğini parse eder ve metadata çıkarır
 * @param {string} markdownContent - Markdown içeriği
 * @returns {object} Parse edilmiş veri
 */
const parseMarkdownContent = (markdownContent) => {
  const lines = markdownContent.split("\n");
  let title = "";
  let content = markdownContent;
  let summary = "";

  // İlk başlık (# ile başlayan) başlık olarak alınır
  const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
    // Başlığı içerikten çıkar
    content = markdownContent.replace(/^#\s+.+$/m, "").trim();
  }

  // İlk paragrafı özet olarak al (resim linklerini ve başlıkları hariç tut)
  const paragraphs = content.split("\n\n").filter((para) => {
    const trimmed = para.trim();
    return (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("![") &&
      !trimmed.startsWith("```") &&
      trimmed.length > 20
    ); // En az 20 karakter
  });

  if (paragraphs.length > 0) {
    let rawSummary = paragraphs[0].trim();
    // Maksimum 197 karakter al ki "..." eklediğimizde 200'ü geçmesin
    if (rawSummary.length > 197) {
      summary = rawSummary.substring(0, 197) + "...";
    } else {
      summary = rawSummary;
    }
  }

  return {
    title: title || "Başlıksız Post",
    content,
    summary: summary || "Özet bulunamadı",
    originalContent: markdownContent,
  };
};

/**
 * Markdown içindeki görsel referanslarını bulur
 * @param {string} markdownContent - Markdown içeriği
 * @returns {Array} Görsel referansları
 */
const extractImageReferences = (markdownContent) => {
  // ![alt text](filename) formatındaki görselleri bul
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdownContent)) !== null) {
    const altText = match[1] || "";
    const filename = match[2];

    // Sadece local dosya referanslarını al (http/https değil)
    if (!filename.startsWith("http://") && !filename.startsWith("https://")) {
      images.push({
        altText,
        filename: path.basename(filename), // Sadece dosya adı
        originalMatch: match[0],
        fullPath: filename,
      });
    }
  }

  return images;
};

/**
 * Upload edilen dosyaları organize eder (markdown ve görsel dosyaları ayırır)
 * @param {Array} files - Multer files array
 * @returns {object} Organize edilmiş dosyalar
 */
const organizeUploadedFiles = (files) => {
  const markdownFiles = [];
  const imageFiles = [];

  files.forEach((file) => {
    if (
      file.originalname.endsWith(".md") ||
      file.mimetype === "text/markdown" ||
      file.mimetype === "text/plain"
    ) {
      markdownFiles.push(file);
    } else if (file.mimetype.startsWith("image/")) {
      imageFiles.push(file);
    }
  });

  return { markdownFiles, imageFiles };
};

/**
 * Görsel dosyasını veritabanına kaydeder
 * @param {object} imageFile - Multer file object
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} altText - Alt text
 * @returns {Promise<object>} Kaydedilen görsel bilgisi
 */
const saveImageToDatabase = async (imageFile, userId, altText = "") => {
  try {
    const image = new Image({
      filename: imageFile.originalname,
      altText: altText || `Imported: ${imageFile.originalname}`,
      uploadedBy: userId,
      data: imageFile.buffer,
      contentType: imageFile.mimetype,
      isImported: true,
      url: "temp", // Geçici URL, save'den sonra güncellenir
      path: "temp", // Geçici path, save'den sonra güncellenir
    });

    // Önce kaydet ki ID oluşsun
    await image.save();

    // Şimdi doğru path ve URL'i set et
    image.path = `/api/images/${image._id}`;
    image.url = image.path; // URL ve path aynı olabilir
    await image.save();

    return {
      _id: image._id,
      path: image.path,
      url: image.url,
      filename: image.filename,
      altText: image.altText,
      originalFilename: imageFile.originalname,
    };
  } catch (error) {
    console.error(
      `Failed to save image: ${imageFile.originalname}`,
      error.message
    );
    throw error;
  }
};

/**
 * Markdown içindeki görsel referanslarını güncellenmiş URL'lerle değiştirir
 * @param {string} markdownContent - Orijinal markdown içeriği
 * @param {Array} imageReferences - Görsel referansları
 * @param {Array} savedImages - Kaydedilmiş görseller
 * @param {object} req - Request objesi (URL oluşturmak için)
 * @returns {string} Güncellenmiş markdown içeriği
 */
const updateMarkdownImageReferences = (
  markdownContent,
  imageReferences,
  savedImages,
  req
) => {
  let updatedContent = markdownContent;

  imageReferences.forEach((imageRef) => {
    // İlgili kaydedilmiş görseli bul
    const savedImage = savedImages.find(
      (saved) =>
        saved.originalFilename === imageRef.filename ||
        saved.filename === imageRef.filename
    );

    if (savedImage) {
      const newImageUrl = `${req.protocol}://${req.get("host")}${
        savedImage.path || savedImage.url
      }`;
      const newMarkdown = `![${imageRef.altText}](${newImageUrl})`;

      updatedContent = updatedContent.replace(
        imageRef.originalMatch,
        newMarkdown
      );
    }
  });

  return updatedContent;
};

/**
 * Markdown projesi import işlemini gerçekleştirir
 * @param {Array} files - Upload edilen dosyalar
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} req - Request objesi
 * @returns {Promise<object>} İşlem sonucu
 */
const processMarkdownProject = async (files, userId, req) => {
  try {
    const { markdownFiles, imageFiles } = organizeUploadedFiles(files);

    if (markdownFiles.length === 0) {
      throw new Error("Hiç markdown dosyası bulunamadı");
    }

    if (markdownFiles.length > 1) {
      throw new Error("Aynı anda sadece bir markdown dosyası işlenebilir");
    }

    const markdownFile = markdownFiles[0];
    const markdownContent = markdownFile.buffer.toString("utf-8");

    // Markdown'ı parse et
    const parsedMarkdown = parseMarkdownContent(markdownContent);

    // Görsel referanslarını bul
    const imageReferences = extractImageReferences(parsedMarkdown.content);

    // Görselleri kaydet
    const savedImages = [];
    const imageErrors = [];

    for (const imageFile of imageFiles) {
      try {
        // İlgili referansı bul (alt text için)
        const imageRef = imageReferences.find(
          (ref) =>
            ref.filename === imageFile.originalname ||
            imageFile.originalname.includes(
              ref.filename.replace(/\.[^/.]+$/, "")
            )
        );

        const altText = imageRef ? imageRef.altText : "";
        const savedImage = await saveImageToDatabase(
          imageFile,
          userId,
          altText
        );
        savedImages.push({
          ...savedImage,
          originalFilename: imageFile.originalname,
        });
      } catch (error) {
        imageErrors.push({
          filename: imageFile.originalname,
          error: error.message,
        });
      }
    }

    // Markdown içindeki görsel referanslarını güncelle
    const updatedContent = updateMarkdownImageReferences(
      parsedMarkdown.content,
      imageReferences,
      savedImages,
      req
    );

    return {
      title: parsedMarkdown.title,
      content: updatedContent,
      summary: parsedMarkdown.summary,
      originalContent: parsedMarkdown.originalContent,
      savedImages,
      imageErrors,
      stats: {
        totalImages: imageFiles.length,
        successfulImages: savedImages.length,
        failedImages: imageErrors.length,
        foundReferences: imageReferences.length,
      },
    };
  } catch (error) {
    console.error("Markdown project processing failed:", error.message);
    throw error;
  }
};

module.exports = {
  parseMarkdownContent,
  extractImageReferences,
  organizeUploadedFiles,
  saveImageToDatabase,
  updateMarkdownImageReferences,
  processMarkdownProject,
};
