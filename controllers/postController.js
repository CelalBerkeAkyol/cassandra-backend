const Post = require("../Models/PostSchema");

// Yeni post ekleme
const newPost = async (req, res) => {
  console.info("post/newPost: Yeni post ekleme işlemi başladı.");
  const { title, content } = req.body;

  if (!title || !content) {
    console.error("post/newPost: Eksik veri – başlık veya içerik sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Başlık ve içerik zorunludur.",
    });
  }

  try {
    const post = await Post.create({
      ...req.body,
      author: req.user.id,
    });

    console.info("post/newPost: Post oluşturuldu, ID:", post._id);
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("post/newPost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, post oluşturulamadı.",
      error: error.message,
    });
  }
};

// Tüm postları getirir, sayfalama destekli
const getAllPosts = async (req, res) => {
  console.info("post/getAllPosts: Tüm postlar getirilmeye çalışılıyor.");
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
    if (startIndex > 0) pagination.previous = { page: page - 1, limit };
    if (startIndex + limit < total) pagination.next = { page: page + 1, limit };

    console.info(`post/getAllPosts: ${allPosts.length} post getirildi.`);
    res.status(200).json({
      success: true,
      count: allPosts.length,
      total,
      pagination,
      data: allPosts,
    });
  } catch (err) {
    console.error("post/getAllPosts hata:", err);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, yazılar getirilemedi.",
      error: err.message,
    });
  }
};

// ID'ye göre post getirir
const postById = async (req, res) => {
  console.info("post/postById: Post getirme işlemi başladı, ID:", req.post._id);
  try {
    await req.post.populate("author", "userName");
    console.info("post/postById: Post getirildi, ID:", req.post._id);

    res.status(200).json({
      success: true,
      post: req.post,
    });
  } catch (error) {
    console.error("post/postById hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
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
      message: "Post başarıyla silindi.",
    });
  } catch (error) {
    console.error("post/deletePost hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// Post güncelleme
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
      message: "Güncelleme için veri sağlanmadı.",
    });
  }

  req.post.title = updatedData.title || req.post.title;
  req.post.content = updatedData.content || req.post.content;
  req.post.category = updatedData.category || req.post.category;

  try {
    const updatedPost = await req.post.save();

    console.info("post/updatePost: Post güncellendi, ID:", updatedPost._id);
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("post/updatePost hata:", error);
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
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("post/incPostView hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
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
      return res
        .status(400)
        .json({ success: false, message: "Bu postu zaten beğendiniz." });
    }

    req.post.likedBy.push(userId);
    req.post.likes += 1;

    const updatedPost = await req.post.save();

    console.info(
      "post/incPostLike: Post beğeni sayısı artırıldı, yeni değer:",
      updatedPost.likes
    );
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("post/incPostLike hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
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
      return res
        .status(400)
        .json({ success: false, message: "Bu postu zaten downvote ettiniz." });
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
