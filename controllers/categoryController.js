const Post = require("../Models/PostSchema");

// Kategori ismine göre ilgili postları getirir
const getPostsByCategoriesName = async (req, res) => {
  const categoryName = req.params.category;
  console.info(
    `category/getPostsByCategoriesName: ${categoryName} kategorisindeki postlar aranıyor.`
  );

  try {
    const posts = await Post.find({ category: categoryName })
      .populate("author", "userName profileImage occupation")
      .sort({ createdAt: -1 })
      .exec();

    if (!posts || posts.length === 0) {
      console.info(
        `category/getPostsByCategoriesName: ${categoryName} kategorisinde post bulunamadı.`
      );
      return res.status(404).json({
        success: false,
        message: "Bu kategoriye ait herhangi bir post bulunmamaktadır.",
        error: {
          code: "NOT_FOUND",
          details: ["Belirtilen kategoriye ait post bulunamadı."],
        },
      });
    }

    console.info(
      `category/getPostsByCategoriesName: ${categoryName} kategorisinde ${posts.length} post getirildi.`
    );
    return res.status(200).json({
      success: true,
      message: `${categoryName} kategorisindeki postlar başarıyla getirildi.`,
      data: posts,
    });
  } catch (error) {
    console.error("category/getPostsByCategoriesName hata:", error);
    return res.status(500).json({
      success: false,
      message: "Postlar getirilirken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

// Tüm kategorileri döndürür (Post modelindeki enum değerleri üzerinden)
const getAllCategories = async (req, res) => {
  console.info("category/getAllCategories: Tüm kategoriler aranıyor.");
  try {
    const categories = Post.schema.path("category").enumValues;

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hiç kategori bulunamadı.",
        error: {
          code: "NOT_FOUND",
          details: ["Sistemde tanımlı kategori bulunamadı."],
        },
      });
    }

    console.info("category/getAllCategories: Kategoriler başarıyla getirildi.");
    res.status(200).json({
      success: true,
      message: "Tüm kategoriler başarıyla getirildi.",
      data: categories,
    });
  } catch (error) {
    console.error("category/getAllCategories hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategoriler getirilirken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

module.exports = {
  getPostsByCategoriesName,
  getAllCategories,
};
