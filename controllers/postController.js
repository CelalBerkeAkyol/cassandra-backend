const Post = require("../Models/PostSchema");
const { processPostImages } = require("../Helpers/imageProcessingHelpers");
const {
  processMarkdownProject,
} = require("../Helpers/markdownProcessingHelpers");

// Yeni post ekleme - otomatik image processing ile
const newPost = async (req, res) => {
  console.info("post/newPost: Yeni post ekleme işlemi başladı.");
  const { title, content, summary } = req.body;

  if (!title || !content || !summary) {
    console.error("post/newPost: Eksik veri – başlık veya içerik sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Başlık ve içerik zorunludur",
      error: {
        code: "MISSING_FIELDS",
        details: ["Başlık ve içerik alanları zorunludur."],
      },
    });
  }

  try {
    // Image processing'i devre dışı bırakmak için query parameter kontrol et
    const skipImageProcessing = req.query.skipImageProcessing === "true";

    let processedContent = content;
    let imageProcessingInfo = {
      processedImages: [],
      errors: [],
      skipped: skipImageProcessing,
    };

    // Eğer image processing aktifse, içerikteki external image'ları işle
    if (!skipImageProcessing) {
      try {
        console.info("post/newPost: External image'lar işleniyor...");
        const imageResult = await processPostImages(content, req.user.id, req);

        processedContent = imageResult.updatedContent;
        imageProcessingInfo = {
          processedImages: imageResult.processedImages,
          errors: imageResult.errors,
          skipped: false,
        };

        if (imageResult.processedImages.length > 0) {
          console.info(
            `post/newPost: ${imageResult.processedImages.length} image başarıyla işlendi.`
          );
        }

        if (imageResult.errors.length > 0) {
          console.warn(
            `post/newPost: ${imageResult.errors.length} image işlenirken hata oluştu.`
          );
        }
      } catch (imageError) {
        console.error("post/newPost: Image processing hatası:", imageError);
        // Image processing başarısız olsa da post'u kaydet, ama hata bilgisini döndür
        imageProcessingInfo.errors.push({
          general: "Image processing failed",
          error: imageError.message,
        });
      }
    }

    // Post'u oluştur (işlenmiş content ile)
    const post = await Post.create({
      ...req.body,
      content: processedContent,
      author: req.user.id,
    });

    console.info("post/newPost: Post oluşturuldu, ID:", post._id);

    // Response'da image processing bilgilerini de döndür
    res.status(201).json({
      success: true,
      message: "Post başarıyla oluşturuldu",
      data: post,
      imageProcessing: imageProcessingInfo,
    });
  } catch (error) {
    console.error("post/newPost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post oluşturulurken bir hata oluştu."],
      },
    });
  }
};

// Tüm postları getirir, sayfalama destekli
const getAllPosts = async (req, res) => {
  console.info("post/getAllPosts: Tüm postlar getirilmeye çalışılıyor.");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments();

    const allPosts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("author", "userName role occupation profileImage");

    const pagination = {};
    if (startIndex > 0) pagination.previous = { page: page - 1, limit };
    if (startIndex + limit < total) pagination.next = { page: page + 1, limit };

    const response = {
      success: true,
      message: "Postlar başarıyla getirildi",
      data: {
        posts: allPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          ...pagination,
        },
      },
    };

    console.info(`post/getAllPosts: ${allPosts.length} post getirildi.`);
    res.status(200).json(response);
  } catch (err) {
    console.error("post/getAllPosts hata:", err);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Postlar getirilirken bir hata oluştu."],
      },
    });
  }
};

// ID'ye göre post getirir
const postById = async (req, res) => {
  console.info("post/postById: Post getirme işlemi başladı, ID:", req.post._id);
  try {
    // Yazarın daha fazla bilgisini populate etme (meslek ve profil fotoğrafı dahil)
    await req.post.populate("author", "userName occupation profileImage");

    const response = {
      success: true,
      message: "Post başarıyla getirildi",
      data: req.post,
    };

    console.info("post/postById: Post getirildi, ID:", req.post._id);
    res.status(200).json(response);
  } catch (error) {
    console.error("post/postById hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post getirilirken bir hata oluştu."],
      },
    });
  }
};

// Post silme
const deletePost = async (req, res) => {
  console.info("post/deletePost: Post silme işlemi başladı, ID:", req.post._id);
  try {
    await req.post.deleteOne();
    console.info("post/deletePost: Post başarıyla silindi, ID:", req.post._id);

    res.status(200).json({
      success: true,
      message: "Post başarıyla silindi",
      data: null,
    });
  } catch (error) {
    console.error("post/deletePost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post silinirken bir hata oluştu."],
      },
    });
  }
};

// Post güncelleme - otomatik image processing ile
const updatePost = async (req, res) => {
  console.info(
    "post/updatePost: Post güncelleme işlemi başladı, ID:",
    req.post._id
  );

  const updatedData = req.body;
  if (Object.keys(updatedData).length === 0) {
    console.error("post/updatePost: Güncelleme için veri sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Güncelleme için veri sağlanmadı",
      error: {
        code: "MISSING_UPDATE_DATA",
        details: ["Güncelleme için gerekli veriler sağlanmadı."],
      },
    });
  }

  try {
    // Image processing'i devre dışı bırakmak için query parameter kontrol et
    const skipImageProcessing = req.query.skipImageProcessing === "true";

    let processedContent = updatedData.content || req.post.content;
    let imageProcessingInfo = {
      processedImages: [],
      errors: [],
      skipped: skipImageProcessing || !updatedData.content,
    };

    // Eğer content güncelleniyor ve image processing aktifse
    if (updatedData.content && !skipImageProcessing) {
      try {
        console.info("post/updatePost: External image'lar işleniyor...");
        const imageResult = await processPostImages(
          updatedData.content,
          req.user.id,
          req
        );

        processedContent = imageResult.updatedContent;
        imageProcessingInfo = {
          processedImages: imageResult.processedImages,
          errors: imageResult.errors,
          skipped: false,
        };

        if (imageResult.processedImages.length > 0) {
          console.info(
            `post/updatePost: ${imageResult.processedImages.length} image başarıyla işlendi.`
          );
        }

        if (imageResult.errors.length > 0) {
          console.warn(
            `post/updatePost: ${imageResult.errors.length} image işlenirken hata oluştu.`
          );
        }
      } catch (imageError) {
        console.error("post/updatePost: Image processing hatası:", imageError);
        imageProcessingInfo.errors.push({
          general: "Image processing failed",
          error: imageError.message,
        });
      }
    }

    // Post'u güncelle
    req.post.title = updatedData.title || req.post.title;
    req.post.content = processedContent;
    req.post.category = updatedData.category || req.post.category;
    req.post.summary = updatedData.summary || req.post.summary;

    const updatedPost = await req.post.save();

    console.info("post/updatePost: Post güncellendi, ID:", updatedPost._id);
    res.status(200).json({
      success: true,
      message: "Post başarıyla güncellendi",
      data: updatedPost,
      imageProcessing: imageProcessingInfo,
    });
  } catch (error) {
    console.error("post/updatePost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post güncellenirken bir hata oluştu."],
      },
    });
  }
};

// Post okunma sayısını artırır
const incPostView = async (req, res) => {
  console.info(
    "post/incPostView: Post view artırma işlemi başladı, ID:",
    req.post._id
  );
  try {
    req.post.views = (req.post.views || 0) + 1;
    const updatedPost = await req.post.save();

    console.info(
      "post/incPostView: Post view sayısı artırıldı, yeni değer:",
      updatedPost.views
    );
    res.status(200).json({
      success: true,
      message: "Post görüntülenme sayısı güncellendi",
      data: updatedPost,
    });
  } catch (error) {
    console.error("post/incPostView hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post görüntülenme sayısı güncellenirken bir hata oluştu."],
      },
    });
  }
};

// Post beğeni artırma
const incPostLike = async (req, res) => {
  console.info(
    "post/incPostLike: Post beğeni artırma işlemi başladı, ID:",
    req.post._id
  );

  try {
    const userId = req.user.id;

    const wasDisliked = req.post.dislikedBy.some(
      (id) => id.toString() === userId
    );
    if (wasDisliked) {
      req.post.dislikedBy = req.post.dislikedBy.filter(
        (id) => id.toString() !== userId
      );
      req.post.dislikes = Math.max(0, req.post.dislikes - 1);
    }

    const hasLiked = req.post.likedBy.some((id) => id.toString() === userId);
    if (hasLiked) {
      return res.status(400).json({
        success: false,
        message: "Bu postu zaten beğendiniz",
        error: {
          code: "ALREADY_LIKED",
          details: ["Bu postu daha önce beğendiniz."],
        },
      });
    }

    req.post.likedBy.push(userId);
    req.post.likes += 1;

    const updatedPost = await req.post.save();

    console.info(
      "post/incPostLike: Post beğeni sayısı artırıldı, yeni değer:",
      updatedPost.likes
    );
    res.status(200).json({
      success: true,
      message: "Post beğeni sayısı güncellendi",
      data: updatedPost,
    });
  } catch (error) {
    console.error("post/incPostLike hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Post beğeni sayısı güncellenirken bir hata oluştu."],
      },
    });
  }
};

// Post dislike (downvote) artırma
const decPostLike = async (req, res) => {
  console.info("post/decPostLike: Downvote işlemi başladı, ID:", req.post._id);

  try {
    const userId = req.user.id;

    const wasLiked = req.post.likedBy.some((id) => id.toString() === userId);
    if (wasLiked) {
      req.post.likedBy = req.post.likedBy.filter(
        (id) => id.toString() !== userId
      );
      req.post.likes = Math.max(0, req.post.likes - 1);
    }

    const hasDownvoted = req.post.dislikedBy.some(
      (id) => id.toString() === userId
    );
    if (hasDownvoted) {
      return res.status(400).json({
        success: false,
        message: "Bu postu zaten downvote ettiniz",
        error: {
          code: "ALREADY_DISLIKED",
          details: ["Bu postu daha önce beğenmediniz."],
        },
      });
    }

    req.post.dislikedBy.push(userId);
    req.post.dislikes += 1;

    const updatedPost = await req.post.save();

    console.info(
      "post/decPostLike: Downvote işlemi başarılı, yeni değer:",
      updatedPost.dislikes
    );
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("post/decPostLike hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// Postlarda arama yapar
const searchPosts = async (req, res) => {
  console.info("post/searchPosts: Arama işlemi başladı");

  try {
    const query = req.query.query;
    const limit = parseInt(req.query.limit) || 20;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Arama sorgusu gereklidir",
        error: {
          code: "MISSING_QUERY",
          details: ["Arama için query parametresi gereklidir"],
        },
      });
    }

    // Başlık, içerik, kategori ve özette arama yap
    const searchResults = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { summary: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("author", "userName role occupation profileImage");

    console.info(`post/searchPosts: ${searchResults.length} post bulundu.`);

    // Sonuç bulunamadığında da başarılı yanıt dön, sadece boş dizi gönder
    // Bu şekilde hata düşmeyecek ve front-end tarafında daha iyi işlenebilecek
    return res.status(200).json({
      success: true,
      message:
        searchResults.length > 0
          ? "Arama sonuçları başarıyla getirildi"
          : "Arama kriterlerinize uygun içerik bulunamadı",
      data: searchResults,
      count: searchResults.length,
    });
  } catch (err) {
    console.error("post/searchPosts hata:", err);
    res.status(500).json({
      success: false,
      message:
        "Arama yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu kaynaklı bir hata oluştu."],
      },
    });
  }
};

// Markdown projesi import etme (markdown dosyası + görseller)
const importMarkdownProject = async (req, res) => {
  console.info(
    "post/importMarkdownProject: Markdown projesi import işlemi başladı."
  );

  try {
    // Dosya kontrolü
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Hiç dosya yüklenmedi",
        error: {
          code: "NO_FILES",
          details: ["Markdown dosyası ve görselleri yükleyin."],
        },
      });
    }

    console.info(
      `post/importMarkdownProject: ${req.files.length} dosya işleniyor...`
    );

    // Markdown projesini işle
    const result = await processMarkdownProject(req.files, req.user.id, req);

    // Kategori kontrolü - varsayılan kategori belirle
    const category = req.body.category || "Genel";

    // Post'u oluştur
    const post = await Post.create({
      title: result.title,
      content: result.content,
      summary: result.summary,
      category: category,
      author: req.user.id,
    });

    console.info("post/importMarkdownProject: Post oluşturuldu, ID:", post._id);

    // Detaylı response döndür
    res.status(201).json({
      success: true,
      message: "Markdown projesi başarıyla import edildi",
      data: post,
      importDetails: {
        savedImages: result.savedImages,
        imageErrors: result.imageErrors,
        stats: result.stats,
        originalContent: result.originalContent,
      },
    });
  } catch (error) {
    console.error("post/importMarkdownProject hata:", error);
    res.status(500).json({
      success: false,
      message: "Markdown projesi import edilirken hata oluştu",
      error: {
        code: "IMPORT_ERROR",
        details: [error.message],
      },
    });
  }
};

module.exports = {
  newPost,
  getAllPosts,
  postById,
  deletePost,
  updatePost,
  incPostView,
  incPostLike,
  decPostLike,
  searchPosts,
  importMarkdownProject,
};
