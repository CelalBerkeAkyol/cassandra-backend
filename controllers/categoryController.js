const Post = require("../Models/PostSchema");

// Kategori ismine göre ilgili postları getirir
const getPostsByCategoriesName = async (req, res) => {
  const categoryName = req.params.category;
  console.info(
    `auth/getPostsByCategoriesName: ${categoryName} kategorisindeki postlar aranıyor.`
  );

  try {
    const posts = await Post.find({ category: categoryName })
      .populate("author", "userName role profileImage")
      .sort({ createdAt: -1 })
      .exec();

    if (!posts || posts.length === 0) {
      console.info(
        `auth/getPostsByCategoriesName: ${categoryName} kategorisinde post bulunamadı.`
      );
      return res.status(404).json({
        success: false,
        message: "Bu kategoriye ait herhangi bir post bulunmamaktadır.",
      });
    }

    console.info(
      `auth/getPostsByCategoriesName: ${categoryName} kategorisinde ${posts.length} post getirildi.`
    );
    return res.status(200).json({
      success: true,
      message: `${categoryName} kategorisindeki postlar başarıyla getirildi.`,
      posts,
    });
  } catch (error) {
    console.error("auth/getPostsByCategoriesName hata:", error);
    return res.status(500).json({
      success: false,
      message: "Veritabanında bir hata oluştu.",
      error: error.message,
    });
  }
};

// Tüm kategorileri döndürür (Post modelindeki enum değerleri üzerinden)
const getAllCategory = async (req, res) => {
  console.info("auth/getAllCategory: Tüm kategoriler aranıyor.");
  try {
    const allCategory = Post.schema.path("category").enumValues;

    console.info("auth/getAllCategory: Kategoriler başarıyla getirildi.");
    res.status(200).json({
      success: true,
      message: "Tüm kategoriler başarıyla getirildi.",
      allCategory,
    });
  } catch (error) {
    console.error("auth/getAllCategory hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategoriler getirilemedi.",
      error: error.message,
    });
  }
};

module.exports = {
  getPostsByCategoriesName,
  getAllCategory,
};
