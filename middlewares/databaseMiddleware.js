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

/**
 * Middleware to clean up user data before deletion
 * Runs before actual user deletion to remove all related user data
 */
const cleanupUserData = async (req, res, next) => {
  const userId = req.params.id;

  // ID kontrolü
  if (!userId) {
    console.error("cleanupUserData: Kullanıcı ID'si sağlanmadı");
    return res.status(400).json({
      success: false,
      message: "Kullanıcı ID'si sağlanmadı",
      error: {
        code: "USER_ID_NOT_PROVIDED",
        details: ["Kullanıcı ID'si sağlanmadı."],
      },
    });
  }

  try {
    console.info(`cleanupUserData: Cleaning up data for user ID: ${userId}`);

    // Post modelini kullanarak kullanıcıyla ilişkili verilerin temizlenmesi
    try {
      // 2. Remove user from likes/references in posts
      if (mongoose.Types.ObjectId.isValid(userId)) {
        // Kullanıcının beğenilerini temizle
        const updateResult = await Post.updateMany(
          { likes: userId },
          { $pull: { likes: userId } }
        );
        console.info(
          `cleanupUserData: Removed user from ${updateResult.modifiedCount} posts' likes for ID: ${userId}`
        );
      }
    } catch (postError) {
      // Post işlemleri başarısız olursa, loglayalım ama işleme devam edelim
      console.warn(
        `cleanupUserData: Error cleaning post references: ${postError.message}`
      );
    }

    console.info(
      `cleanupUserData: Successfully cleaned up data for user ID: ${userId}`
    );

    // Continue with the user deletion
    next();
  } catch (error) {
    console.error(`cleanupUserData error: ${error.message}`, error);

    // Hata durumunda kullanıcı yine de silinmeli, bu yüzden devam ediyoruz
    console.warn(
      `cleanupUserData: Proceeding with user deletion despite cleanup error for ID: ${userId}`
    );
    next();
  }
};

module.exports = { checkPostId, cleanupUserData };
