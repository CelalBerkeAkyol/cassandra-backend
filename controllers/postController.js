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
    // Yeni post oluştur
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

// ID'ye göre post getirir
// checkPostId middleware'i ile post zaten req.post içerisine eklenmiştir
const postById = async (req, res) => {
  console.info("postById: Post getirme işlemi başladı, ID:", req.post._id);
  try {
    // populate sadece gerektiğinde yapılır
    await req.post.populate("author", "userName");
    console.info("postById: Post getirildi, ID:", req.post._id);

    res.status(200).json({
      success: true,
      post: req.post,
    });
  } catch (error) {
    console.error("postById hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// Post silme
// checkPostId ile post önceden bulunmuş halde
const deletePost = async (req, res) => {
  console.info("deletePost: Post silme işlemi başladı, ID:", req.post._id);
  try {
    await req.post.deleteOne();
    console.info("deletePost: Post başarıyla silindi, ID:", req.post._id);

    res.status(200).json({
      success: true,
      message: "Post başarıyla silindi.",
    });
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
// Mevcut post objesini (req.post) kullanarak günceller
const updatePost = async (req, res) => {
  console.info("updatePost: Post güncelleme işlemi başladı, ID:", req.post._id);

  const updatedData = req.body;
  if (Object.keys(updatedData).length === 0) {
    console.error("updatePost: Güncelleme için veri sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Güncelleme için veri sağlanmadı.",
    });
  }

  // Eksik alanlar varsa orijinal veriyi koru
  req.post.title = updatedData.title || req.post.title;
  req.post.content = updatedData.content || req.post.content;
  req.post.category = updatedData.category || req.post.category;
  // ihtiyaca göre başka alanlar da eklenebilir

  try {
    // Mongoose validations devreye girsin diye save() kullanıyoruz
    const updatedPost = await req.post.save();

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

// Post okunma sayısını artırır
// Orijinal kaydı tekrar aramadan doğrudan req.post üzerinden güncelliyoruz
const incPostView = async (req, res) => {
  console.info(
    "incPostView: Post view artırma işlemi başladı, ID:",
    req.post._id
  );
  try {
    req.post.views = (req.post.views || 0) + 1; // null olabilir ihtimaline karşı
    const updatedPost = await req.post.save();

    console.info(
      "incPostView: Post view sayısı artırıldı, yeni değer:",
      updatedPost.views
    );
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("incPostView hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// controllers/postController.js
const incPostLike = async (req, res) => {
  console.info(
    "incPostLike: Post beğeni artırma işlemi başladı, ID:",
    req.post._id
  );

  try {
    const userId = req.user.id; // auth middleware ile gelen kullanıcı ID

    // Eğer kullanıcı zaten dislikedBy listesindeyse => downvote'u geri çek
    const wasDisliked = req.post.dislikedBy.some(
      (dislikedUserId) => dislikedUserId.toString() === userId.toString()
    );
    if (wasDisliked) {
      // dislikedBy'dan çıkar
      req.post.dislikedBy = req.post.dislikedBy.filter(
        (dislikedUserId) => dislikedUserId.toString() !== userId.toString()
      );
      // dislikes sayısını 1 azalt
      req.post.dislikes = Math.max(0, req.post.dislikes - 1);
    }

    // Şimdi bu kullanıcı zaten likedBy’da mı?
    const hasLiked = req.post.likedBy.some(
      (likedUserId) => likedUserId.toString() === userId.toString()
    );
    if (hasLiked) {
      // Zaten beğenmiş -> tekrar beğenmesine gerek yok
      return res.status(400).json({
        success: false,
        message: "Bu postu zaten beğendiniz.",
      });
    }

    // Kullanıcıyı likedBy dizisine ekleyip likes’ı artır
    req.post.likedBy.push(userId);
    req.post.likes += 1;

    const updatedPost = await req.post.save();

    console.info(
      "incPostLike: Post beğeni sayısı artırıldı, yeni değer:",
      updatedPost.likes
    );
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("incPostLike hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

const decPostLike = async (req, res) => {
  console.info("decPostLike: Downvote işlemi başladı, ID:", req.post._id);

  try {
    const userId = req.user.id;

    // Eğer kullanıcı daha önce like yapmışsa => upvote'u geri çek
    const wasLiked = req.post.likedBy.some(
      (likedUserId) => likedUserId.toString() === userId.toString()
    );
    if (wasLiked) {
      // likedBy'dan çıkar
      req.post.likedBy = req.post.likedBy.filter(
        (likedUserId) => likedUserId.toString() !== userId.toString()
      );
      // likes sayısını 1 azalt
      req.post.likes = Math.max(0, req.post.likes - 1);
    }

    // Bu kullanıcı zaten dislikedBy'da mı?
    const hasDownvoted = req.post.dislikedBy.some(
      (dislikedUserId) => dislikedUserId.toString() === userId.toString()
    );
    if (hasDownvoted) {
      return res.status(400).json({
        success: false,
        message: "Bu postu zaten downvote ettiniz.",
      });
    }

    // Kullanıcıyı dislikedBy dizisine ekleyip dislikes’ı artır
    req.post.dislikedBy.push(userId);
    req.post.dislikes += 1;

    const updatedPost = await req.post.save();

    console.info(
      "decPostLike: Downvote işlemi başarılı, yeni değer:",
      updatedPost.dislikes
    );
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("decPostLike hata:", error);
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
  postById,
  deletePost,
  updatePost,
  incPostView,
  incPostLike,
  decPostLike,
};
