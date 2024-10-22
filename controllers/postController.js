// mongo database ile işlem yapabilmek için

const Post = require("../Models/PostSchema");
// yeni post ekleme fonksiyonu
const newPost = async (req, res) => {
  // Req body ve user bilgilerini kontrol edelim
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Başlık ve içerik zorunludur",
    });
  }

  try {
    // Yeni bir post oluşturalım
    const post = await Post.create({
      ...req.body, // Gönderilen diğer bilgileri al
      user: req.user.id, // Kullanıcı id'si ekle
    });

    // Başarı durumunda 201 ve post bilgilerini döndürelim
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    // Hata durumunda 500 ve hata mesajını döndürelim
    res.status(500).json({
      success: false,
      message: "Sunucu hatası, post oluşturulamadı",
      error: error.message,
    });
  }
};

// bütün paylaşılmış postları veri tabanından çeker
const getAllPosts = async (req, res) => {
  try {
    // Sayfa ve limit bilgilerini al
    const page = parseInt(req.query.page) || 1; // Varsayılan olarak 1. sayfa
    const limit = parseInt(req.query.limit) || 10; // Varsayılan olarak 10 yazı

    // Sayfalamada hangi yazıdan itibaren veri alınacağını hesaplayın (offset)
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Toplam yazı sayısını alın
    const total = await Post.countDocuments();

    // Yazıları sayfalandırarak alın
    const allPosts = await Post.find()
      .skip(startIndex) // Geçerli sayfa için offset
      .limit(limit); // Sayfa başına gösterilecek yazı adedi

    // Pagination objesini oluştur
    const pagination = {};
    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    // Sonuçları döndür
    res.status(200).json({
      success: true,
      count: allPosts.length,
      total: total,
      pagination: pagination,
      data: allPosts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Bir hata oluştu" });
  }
};
const getOnePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  return res.status(200).json({
    success: true,
    data: post,
  });
};
const detelePost = async (req, res) => {
  const { id } = req.params;

  try {
    await Post.deleteOne({ _id: id });
    res.status(201).send("Post has been deleted successfully");
  } catch (error) {
    res.status(404).send("Eksik veya yanlış id değeri girdin");
  }
};
const updatePost = async (req, res) => {
  const id = req.params.id; // urlden post idsi alındı
  const updatedData = req.body;

  if (Object.keys(updatedData).length === 0) {
    return res.status(404).send("Updated data bilgilerini girmedin");
  }
  try {
    // post bul ve güncelle
    const updatedPost = await Post.findByIdAndUpdate(id, updatedData, {
      new: true, // Güncellenmiş postu geri döndürür
      runValidators: true, // Schema validation'ları çalıştırır
    });

    if (!id) {
      return res.status(404).send("Post not found"); // Kullanıcı bulunamazsa 404 döndür
    }

    res.json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  newPost,
  getAllPosts,
  detelePost,
  updatePost,
  getOnePost,
};
