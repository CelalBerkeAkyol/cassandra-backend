// mongo database ile işlem yapabilmek için
const mongosee = require("mongoose");
const User = require("../Models/UserSchema");

// veri tabanındaki tüm kullanıcıları json formatında döndürür
const getAllUserFromDatabase = async (req, res) => {
  const bilgiler = await User.find({});
  res.json(bilgiler);
};

// veri tabanından idsi verilen kullanıcıyı json formatında döndürür
const getUserByIDFromDatabase = async (req, res) => {
  const userID = req.params.id;
  const bilgiler = await User.findOne({ _id: userID });
  res.json({
    message: "Bireysel kullanıcı bilgileriniz",
    bilgiler,
  });
};

//bir kullanıcıyı veri tabanından sil
const deleteUserFromDatabase = async (req, res) => {
  const { id } = req.params;
  await User.deleteOne({ _id: id });
  res.status(201).send("User has been deleted successfully");
};

// tüm kullanıcıları veri tabanından siler
const deleteAllUsersFromDatabase = async (req, res) => {
  try {
    // Tüm kullanıcıları silme işlemi
    const result = await User.deleteMany({});

    // Sonuçları döndürüyoruz
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} kullanıcı silindi.`,
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
  const user_id = req.params.id; // urlden kullanıcı idsi alındı
  const updatedData = req.body;
  try {
    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findByIdAndUpdate(user_id, updatedData, {
      new: true, // Güncellenmiş kullanıcıyı geri döndürür
      runValidators: true, // Schema validation'ları çalıştırır
    });

    if (!updatedUser) {
      return res.status(404).send("User not found"); // Kullanıcı bulunamazsa 404 döndür
    }

    res.json({
      success: true,
      data: updatedUser,
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
  getUserByIDFromDatabase,
};
