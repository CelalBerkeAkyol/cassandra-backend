// /controllers/postController.js
const Post = require("../Models/PostSchema");

// Yeni post ekleme
const newPost = async (req, res) => {
  console.info("newPost: Yeni post ekleme işlemi başladı.");
  const { title, content } = req.body;

  if (!title || !content) {
    console.error("newPost: Eksik veri – başlık veya içerik sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Başlık ve içerik zorunludur.",
    });
  }

  try {
    const post = await Post.create({
      ...req.body,
      author: req.user.id, // token üzerinden gelen kullanıcı ID'si
    });
    console.info("newPost: Post oluşturuldu, ID:", post._id);
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("newPost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, post oluşturulamadı.",
      error: error.message,
    });
  }
};

// Tüm postları getirir, sayfalama destekli
const getAllPosts = async (req, res) => {
  console.info("getAllPosts: Tüm postlar getirilmeye çalışılıyor.");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments();

    const allPosts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("author", "userName role");

    const pagination = {};
    if (startIndex > 0) {
      pagination.previous = { page: page - 1, limit };
    }
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }

    console.info(`getAllPosts: ${allPosts.length} post getirildi.`);
    res.status(200).json({
      success: true,
      count: allPosts.length,
      total,
      pagination,
      data: allPosts,
    });
  } catch (err) {
    console.error("getAllPosts hata:", err);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, yazılar getirilemedi.",
      error: err.message,
    });
  }
};

// Post silme
const deletePost = async (req, res) => {
  console.info("deletePost: Post silme işlemi başladı, ID:", req.post._id);
  try {
    await req.post.deleteOne();
    console.info("deletePost: Post başarıyla silindi, ID:", req.post._id);
    res.status(200).json({ success: true, message: "Post başarıyla silindi." });
  } catch (error) {
    console.error("deletePost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// Post güncelleme
const updatePost = async (req, res) => {
  console.info("updatePost: Post güncelleme işlemi başladı, ID:", req.post._id);
  const updatedData = req.body;

  // Eğer bazı alanlar eksikse mevcut post verilerini kullan
  updatedData.title = updatedData.title || req.post.title;
  updatedData.content = updatedData.content || req.post.content;
  updatedData.category = updatedData.category || req.post.category;
  updatedData.author = updatedData.author || req.post.author;

  if (Object.keys(updatedData).length === 0) {
    console.error("updatePost: Güncelleme için veri sağlanmadı.");
    return res
      .status(400)
      .json({ message: "Güncelleme için veri sağlanmadı." });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.post._id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPost) {
      console.warn("updatePost: Post bulunamadı, ID:", req.post._id);
      return res
        .status(404)
        .json({ success: false, message: "Post bulunamadı." });
    }

    console.info("updatePost: Post güncellendi, ID:", updatedPost._id);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("updatePost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// ID'ye göre post getirir
const postById = async (req, res) => {
  console.info("postById: Post getirme işlemi başladı, ID:", req.post._id);
  try {
    const post = await req.post.populate("author", "userName ");
    console.info("postById: Post getirildi, ID:", post._id);
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("postById hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// Post okunma sayısını artırır
const incPostView = async (req, res) => {
  console.info(
    "incPostView: Post view artırma işlemi başladı, ID:",
    req.post._id
  );
  try {
    const post = await Post.findByIdAndUpdate(
      req.post._id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) {
      console.warn("incPostView: Post bulunamadı, ID:", req.post._id);
      return res
        .status(404)
        .json({ success: false, message: "Post bulunamadı." });
    }

    console.info(
      "incPostView: Post view sayısı artırıldı, yeni değer:",
      post.views
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("incPostView hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

module.exports = {
  newPost,
  getAllPosts,
  deletePost,
  updatePost,
  postById,
  incPostView,
};
