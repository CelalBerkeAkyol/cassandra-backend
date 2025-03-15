// /middlewares/checkPostId.js
const mongoose = require("mongoose");
const Post = require("../Models/PostSchema");

const checkPostId = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("checkPostId: Geçersiz ID:", id);
    return res
      .status(400)
      .json({ success: false, message: "Geçerli bir ID giriniz." });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      console.info("checkPostId: Belirtilen ID'ye ait post bulunamadı:", id);
      return res.status(404).json({
        success: false,
        message: "Bu ID'ye ait bir post bulunmamaktadır.",
      });
    }
    req.post = post;
    console.info("checkPostId: Post bulundu, ID:", id);
    next();
  } catch (error) {
    console.error("checkPostId hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
      error: error.message,
    });
  }
};

module.exports = { checkPostId };
