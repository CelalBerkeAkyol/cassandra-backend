const Post = require("../Models/PostSchema");
const Category = require("../Models/CategorySchema");
const slugify = require("slugify");

// Kategori ismine göre ilgili postları getirir
const getPostsByCategoriesName = async (req, res) => {
  const categoryName = req.params.category;
  console.info(
    `category/getPostsByCategoriesName: ${categoryName} kategorisindeki postlar aranıyor.`
  );

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Post.countDocuments({ category: categoryName });

    const posts = await Post.find({ category: categoryName })
      .populate("author", "userName profileImage occupation")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
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

    const pagination = {};
    if (startIndex > 0) pagination.previous = { page: page - 1, limit };
    if (startIndex + limit < total) pagination.next = { page: page + 1, limit };

    console.info(
      `category/getPostsByCategoriesName: ${categoryName} kategorisinde ${posts.length} post getirildi.`
    );
    return res.status(200).json({
      success: true,
      message: `${categoryName} kategorisindeki postlar başarıyla getirildi.`,
      data: {
        posts: posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          ...pagination,
        },
      },
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
    const dbCategories = await Category.find({ active: true }).sort({
      order: 1,
    });

    if (!dbCategories || dbCategories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Henüz hiç kategori bulunmuyor.",
        data: [],
      });
    }

    // Veritabanındaki kategorileri dön
    res.status(200).json({
      success: true,
      message: "Tüm kategoriler başarıyla getirildi.",
      data: dbCategories.map((cat) => cat.slug),
    });

    console.info("category/getAllCategories: Kategoriler başarıyla getirildi.");
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

// Kategori detaylarını içeren tüm kategorileri döndürür
const getAllCategoriesWithDetails = async (req, res) => {
  console.info(
    "category/getAllCategoriesWithDetails: Kategori detayları getiriliyor."
  );
  try {
    const categories = await Category.find().sort({ order: 1 });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: true,
        message: "Henüz hiç kategori bulunmuyor.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Kategori detayları başarıyla getirildi.",
      data: categories,
    });

    console.info(
      "category/getAllCategoriesWithDetails: Kategori detayları başarıyla getirildi."
    );
  } catch (error) {
    console.error("category/getAllCategoriesWithDetails hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategori detayları getirilirken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

// Yeni kategori ekleme
const createCategory = async (req, res) => {
  console.info("category/createCategory: Yeni kategori oluşturuluyor.");
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Kategori adı zorunludur.",
        error: {
          code: "VALIDATION_ERROR",
          details: ["Kategori adı belirtilmelidir."],
        },
      });
    }

    // Slug oluştur
    const slug = slugify(name, {
      lower: true,
      strict: true,
      replacement: "-",
    });

    // Slug kontrolü yap
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Bu isimde bir kategori zaten mevcut.",
        error: {
          code: "DUPLICATE_ENTRY",
          details: ["Bu kategori adı zaten kullanılıyor."],
        },
      });
    }

    // Yeni kategori oluştur
    const newCategory = new Category({
      name,
      slug,
      description:
        description || `${name} kategorisindeki makaleler ve içerikler.`,
      icon: icon || "mdi:tag",
      color: color || "bg-slate-600",
      active: true,
    });

    await newCategory.save();

    // Post schema enum değerlerine ekle (bu işlem dinamik olarak yapılamaz)
    // Bu nedenle API işleminden sonra manuel olarak PostSchema.js dosyasını güncellemeniz gerekecek

    console.info(
      `category/createCategory: ${slug} kategorisi başarıyla oluşturuldu.`
    );
    res.status(201).json({
      success: true,
      message: "Kategori başarıyla oluşturuldu.",
      data: newCategory,
    });
  } catch (error) {
    console.error("category/createCategory hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategori oluşturulurken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

// Kategori güncelleme
const updateCategory = async (req, res) => {
  console.info("category/updateCategory: Kategori güncelleniyor.");
  try {
    const { id } = req.params;
    const { name, description, icon, color, active } = req.body;

    // Kategoriyi bul
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori bulunamadı.",
        error: {
          code: "NOT_FOUND",
          details: ["Belirtilen ID'ye sahip kategori bulunamadı."],
        },
      });
    }

    // Slug kontrolü
    let newSlug = null;
    if (name && name !== category.name) {
      newSlug = slugify(name, {
        lower: true,
        strict: true,
        replacement: "-",
      });

      const existingCategory = await Category.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Bu isimde bir kategori zaten mevcut.",
          error: {
            code: "DUPLICATE_ENTRY",
            details: ["Bu kategori adı zaten kullanılıyor."],
          },
        });
      }
    }

    // Kategoriyi güncelle
    if (name) category.name = name;
    if (newSlug) category.slug = newSlug;
    if (description) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (active !== undefined) category.active = active;

    await category.save();

    console.info(
      `category/updateCategory: ${category.slug} kategorisi başarıyla güncellendi.`
    );
    res.status(200).json({
      success: true,
      message: "Kategori başarıyla güncellendi.",
      data: category,
    });
  } catch (error) {
    console.error("category/updateCategory hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategori güncellenirken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

// Kategori silme
const deleteCategory = async (req, res) => {
  console.info("category/deleteCategory: Kategori siliniyor.");
  try {
    const { id } = req.params;

    // İlgili kategoride post olup olmadığını kontrol et
    const posts = await Post.find({ category: id }).limit(1);
    if (posts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu kategoriye ait postlar bulunduğu için silinemez.",
        error: {
          code: "CONSTRAINT_ERROR",
          details: [
            "Bu kategoriye ait postlar bulunduğu için kategori silinemez.",
          ],
        },
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori bulunamadı.",
        error: {
          code: "NOT_FOUND",
          details: ["Belirtilen ID'ye sahip kategori bulunamadı."],
        },
      });
    }

    console.info(
      `category/deleteCategory: ${category.slug} kategorisi başarıyla silindi.`
    );
    res.status(200).json({
      success: true,
      message: "Kategori başarıyla silindi.",
    });
  } catch (error) {
    console.error("category/deleteCategory hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategori silinirken bir hata oluştu.",
      error: {
        code: "SERVER_ERROR",
        details: ["Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."],
      },
    });
  }
};

// Kategori detayını getir
const getCategoryById = async (req, res) => {
  console.info("category/getCategoryById: Kategori detayı getiriliyor.");
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori bulunamadı.",
        error: {
          code: "NOT_FOUND",
          details: ["Belirtilen ID'ye sahip kategori bulunamadı."],
        },
      });
    }

    console.info(
      `category/getCategoryById: ${category.slug} kategorisi detayı getirildi.`
    );
    res.status(200).json({
      success: true,
      message: "Kategori detayı başarıyla getirildi.",
      data: category,
    });
  } catch (error) {
    console.error("category/getCategoryById hata:", error);
    res.status(500).json({
      success: false,
      message: "Kategori detayı getirilirken bir hata oluştu.",
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
  getAllCategoriesWithDetails,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
