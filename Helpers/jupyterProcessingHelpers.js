const fs = require("fs");
const path = require("path");
const multer = require("multer");
const archiver = require("archiver");
const extract = require("extract-zip");
const Image = require("../Models/ImageSchema");

/**
 * Jupyter notebook klasör içeriğini işler
 * @param {string} folderPath - Klasör yolu
 * @param {string} userId - Kullanıcı ID'si
 * @param {object} req - Request objesi
 * @returns {Promise<object>} İşlem sonucu
 */
const processJupyterFolder = async (folderPath, userId, req) => {
  try {
    console.log(`Processing Jupyter folder: ${folderPath}`);

    // Klasördeki dosyaları listele
    const files = fs.readdirSync(folderPath);
    console.log(`Found files:`, files);

    // .md dosyasını bul
    const markdownFile = files.find((file) => file.endsWith(".md"));
    if (!markdownFile) {
      throw new Error("Markdown dosyası bulunamadı");
    }

    // Görsel dosyalarını bul
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
    const imageFiles = files.filter((file) =>
      imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    console.log(`Found markdown: ${markdownFile}`);
    console.log(`Found images: ${imageFiles.length}`);

    // Markdown içeriğini oku
    const markdownPath = path.join(folderPath, markdownFile);
    const markdownContent = fs.readFileSync(markdownPath, "utf-8");

    // Markdown'daki görsel referanslarını bul
    const imageReferences = extractMarkdownImages(markdownContent);
    console.log(
      `Found image references in markdown: ${imageReferences.length}`
    );

    // Görselleri upload et ve URL'leri güncelle
    const uploadResults = [];
    const errors = [];
    let updatedMarkdown = markdownContent;

    for (const imageFile of imageFiles) {
      try {
        const imagePath = path.join(folderPath, imageFile);
        const imageBuffer = fs.readFileSync(imagePath);

        // MIME type'ını tespit et
        const mimeType = getMimeTypeFromExtension(imageFile);

        // Veritabanına kaydet
        const image = new Image({
          filename: `${Date.now()}-${imageFile}`,
          altText: imageFile,
          uploadedBy: userId,
          data: imageBuffer,
          contentType: mimeType,
          isImported: false,
          originalUrl: null,
        });

        image.path = `/api/images/${image._id}`;
        await image.save();

        const newImageUrl = `${req.protocol}://${req.get("host")}${image.path}`;

        // Markdown'da bu dosyanın referansını güncelle
        updatedMarkdown = updateMarkdownImageReference(
          updatedMarkdown,
          imageFile,
          newImageUrl
        );

        uploadResults.push({
          originalFile: imageFile,
          newUrl: newImageUrl,
          imageId: image._id,
        });

        console.log(`Uploaded: ${imageFile} -> ${newImageUrl}`);
      } catch (error) {
        console.error(`Failed to upload ${imageFile}:`, error);
        errors.push({
          file: imageFile,
          error: error.message,
        });
      }
    }

    return {
      markdownFile,
      originalContent: markdownContent,
      updatedContent: updatedMarkdown,
      uploadedImages: uploadResults,
      errors,
      totalImages: imageFiles.length,
      successfulUploads: uploadResults.length,
    };
  } catch (error) {
    console.error("Jupyter folder processing failed:", error);
    throw error;
  }
};

/**
 * Markdown içindeki görsel referanslarını çıkarır
 */
const extractMarkdownImages = (content) => {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      altText: match[1],
      path: match[2],
      fullMatch: match[0],
    });
  }

  return images;
};

/**
 * Markdown'da görsel referansını günceller
 */
const updateMarkdownImageReference = (content, originalFileName, newUrl) => {
  // Farklı referans formatlarını dene
  const patterns = [
    new RegExp(`!\\[([^\\]]*)\\]\\(([^)]*${originalFileName}[^)]*)\\)`, "g"),
    new RegExp(`!\\[([^\\]]*)\\]\\(\\./${originalFileName}\\)`, "g"),
    new RegExp(`!\\[([^\\]]*)\\]\\(${originalFileName}\\)`, "g"),
    new RegExp(`!\\[([^\\]]*)\\]\\(([^)]*/)${originalFileName}\\)`, "g"),
  ];

  let updatedContent = content;

  for (const pattern of patterns) {
    updatedContent = updatedContent.replace(pattern, `![$1](${newUrl})`);
  }

  return updatedContent;
};

/**
 * Dosya uzantısından MIME type'ını tespit eder
 */
const getMimeTypeFromExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };

  return mimeTypes[ext] || "image/jpeg";
};

/**
 * ZIP dosyasını extract eder
 */
const extractZipFile = async (zipPath, extractPath) => {
  try {
    await extract(zipPath, { dir: extractPath });
    console.log(`Extracted ZIP to: ${extractPath}`);
    return extractPath;
  } catch (error) {
    console.error("ZIP extraction failed:", error);
    throw error;
  }
};

/**
 * Geçici klasörü temizler
 */
const cleanupTempFolder = (folderPath) => {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`Cleaned up temp folder: ${folderPath}`);
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
};

module.exports = {
  processJupyterFolder,
  extractMarkdownImages,
  updateMarkdownImageReference,
  getMimeTypeFromExtension,
  extractZipFile,
  cleanupTempFolder,
};
