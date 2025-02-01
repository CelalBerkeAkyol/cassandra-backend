const Post = require("../Models/PostSchema");

// kategori ismine göre ilgili postları getirir
const getPostsByCategoriesName = async (req, res) => {
  const categoryName = req.params.category;

  try {
    // Kategori adına göre postları en yeni tarihten en eskiye sıralayarak getir
    const posts = await Post.find({ category: categoryName })
      .populate("author", "userName role profileImage") // Yazar bilgisini ekle
      .sort({ createdAt: -1 }) // En yeni postları en üstte göster
      .exec();

    // Eğer post bulunmazsa
    if (!posts || posts.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "Bu kategoriye ait herhangi bir post bulunmamaktadır.",
        });
    }

    // Postlar bulunduysa bunları döndür
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    // Hata yönetimi
    return res.status(500).json({
      success: false,
      message: "Veritabanında bir hata oluştu.",
      error: error.message,
    });
  }
};

// categorileri veri tabanından çeker
const getAllCategory = async (req, res) => {
  const allCategory = await Post.schema.path("category").enumValues;
  res.json({
    success: true,
    text: "Bütün kategori bunlardır",
    allCategory,
  });
};

module.exports = {
  getPostsByCategoriesName,
  getAllCategory,
};
