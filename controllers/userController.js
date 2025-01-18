// mongo database ile işlem yapabilmek için
const mongosee = require("mongoose");
const User = require("../Models/UserSchema");

// veri tabanındaki tüm yazarları json formatında döndürür
const getAllUserFromDatabase = async (req, res) => {
  console.log("getAllUserFromDatabase çalıştı ");
  const bilgiler = await User.find({});
  if (bilgiler.length === 0) {
    return res.status(404).json({ message: "Hiç kullanıcı bulunamadı." });
  }
  res.json(bilgiler);
};

const getUserByUserNameFromDatabase = async (req, res) => {
  console.log("getUserByUserNameFromDatabase çalıştı");
  const username = req.params.username;
  try {
    const bilgiler = await User.findOne(
      { userName: username },
      "userName role createdAt"
    ); // Sadece gerekli alanları seçiyoruz
    if (!bilgiler) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.json({
      message: "Bireysel kullanıcı bilgileriniz",
      data: bilgiler, // Sadece seçili alanları döndürüyoruz
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
const getUserByID = async (req, res) => {
  console.log("getUserByID çalıştı");
  const id = req.params.id;
  try {
    const bilgiler = await User.findById(
      { _id: id },
      "userName role createdAt"
    ); // Sadece gerekli alanları seçiyoruz
    if (!bilgiler) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.json({
      message: "Bireysel kullanıcı bilgileriniz",
      data: bilgiler, // Sadece seçili alanları döndürüyoruz
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

//bir kullanıcıyı veri tabanından sil
const deleteUserFromDatabase = async (req, res) => {
  const username = req.params.username;
  const result = await User.deleteOne({ userName: username });
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }
  res.status(201).send("User has been deleted successfully");
};

//bir kullanıcıyı veri tabanından sil
const deleteUserByID = async (req, res) => {
  const id = req.params.id;
  const result = await User.deleteOne({ _id: id });
  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }
  res.status(201).send("User has been deleted successfully");
};

// tüm kullanıcıları veri tabanından siler
const deleteAllUsersFromDatabase = async (req, res) => {
  const delete_confirm = req.body.delete_confirm;
  try {
    // Tüm kullanıcıları silme işlemi
    if (delete_confirm == "DELETE ALL USER") {
      const result = await User.deleteMany({});

      // Sonuçları döndürüyoruz
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} kullanıcı silindi.`,
      });
    }
    res.status(400).json({
      success: false,
      message: "Sanırım silmekten vazgeçtiniz ",
    });
  } catch (error) {
    // Hata durumunu yakalayıp döndürüyoruz
    res.status(500).json({
      success: false,
      message: "Kullanıcılar silinirken bir hata oluştu.",
      error: error.message,
    });
  }
};
const updateUserFromDatabase = async (req, res) => {
  const username = req.params.username; // urlden kullanıcı name alındı
  const updatedData = req.body;
  try {
    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findOneAndUpdate(
      { userName: username },
      updatedData,
      {
        new: true, // Güncellenmiş kullanıcıyı geri döndürür
        runValidators: true, // Schema validation'ları çalıştırır
      }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found"); // Kullanıcı bulunamazsa 404 döndür
    }

    res.json({
      success: true,
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  deleteUserFromDatabase,
  updateUserFromDatabase,
  getUserByUserNameFromDatabase,
  getUserByID,
  deleteUserByID,
};
