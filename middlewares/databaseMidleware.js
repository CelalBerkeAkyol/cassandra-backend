const mongoose = require("mongoose");
const Post = require("../Models/PostSchema");

const checkPostId = async (req, res, next) => {
  const { id } = req.params;

  // ID'nin geçerli bir MongoDB ObjectId olup olmadığını kontrol et
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Geçerli bir ID giriniz." });
  }

  try {
    // ID'ye sahip bir post olup olmadığını kontrol et
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Bu ID'ye ait bir post bulunmamaktadır.",
      });
    }

    // Post'u req.post içine ekle, diğer middleware'ler ve fonksiyonlar bunu kullanabilir
    req.post = post;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

module.exports = { checkPostId };
