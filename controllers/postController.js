// mongo database ile işlem yapabilmek için
const mongoose = require("mongoose");
const Post = require("../Models/PostSchema");

// yeni post ekleme fonksiyonu
const newPost = async (req, res) => {
  const { title, content } = req.body;

  // Verilerin eksik olup olmadığını kontrol et
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Başlık ve içerik zorunludur.",
    });
  }

  try {
    const post = await Post.create({
      ...req.body,
      author: req.user.id, // Kullanıcı bilgisini al ve ekle
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, post oluşturulamadı.",
      error: error.message,
    });
  }
};

// bütün paylaşılmış postları veri tabanından çeker
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments();

    const allPosts = await Post.find().skip(startIndex).limit(limit);

    const pagination = {};
    if (startIndex > 0) {
      pagination.previous = { page: page - 1, limit: limit };
    }
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit: limit };
    }

    res.status(200).json({
      success: true,
      count: allPosts.length,
      total: total,
      pagination: pagination,
      data: allPosts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, yazılar getirilemedi.",
      error: err.message,
    });
  }
};

// slug ile bir post getirir
const getOnePost = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Slug parametresi gereklidir.",
    });
  }

  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Böyle bir post bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// post silme fonksiyonu
const deletePost = async (req, res) => {
  try {
    // req.post zaten var, doğrudan kullanabiliriz
    await req.post.deleteOne();
    res.status(200).json({ success: true, message: "Post başarıyla silindi." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// post güncelleme fonksiyonu
const updatePost = async (req, res) => {
  const updatedData = req.body;

  if (Object.keys(updatedData).length === 0) {
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

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

// id ile post getirme
const postById = async (req, res) => {
  try {
    res.status(200).json({ success: true, post: req.post });
  } catch (error) {
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
  getOnePost,
  postById,
};
