// /controllers/userController.js
const mongoose = require("mongoose");
const User = require("../Models/UserSchema");

const getAllUserFromDatabase = async (req, res) => {
  console.info(
    "getAllUserFromDatabase: Tüm kullanıcılar getirilmeye çalışılıyor."
  );
  try {
    const bilgiler = await User.find({});
    if (bilgiler.length === 0) {
      console.info("getAllUserFromDatabase: Hiç kullanıcı bulunamadı.");
      return res.status(404).json({ message: "Hiç kullanıcı bulunamadı." });
    }
    console.info(
      `getAllUserFromDatabase: ${bilgiler.length} kullanıcı getirildi.`
    );
    res.json(bilgiler);
  } catch (error) {
    console.error("getAllUserFromDatabase hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const getUserByUserNameFromDatabase = async (req, res) => {
  console.info("getUserByUserNameFromDatabase: Kullanıcı araması başladı.");
  const username = req.params.username;
  try {
    const bilgiler = await User.findOne(
      { userName: username },
      "userName role createdAt"
    );
    if (!bilgiler) {
      console.info(
        "getUserByUserNameFromDatabase: Kullanıcı bulunamadı:",
        username
      );
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    console.info(
      "getUserByUserNameFromDatabase: Kullanıcı getirildi:",
      username
    );
    res.json({
      message: "Bireysel kullanıcı bilgileriniz",
      data: bilgiler,
    });
  } catch (error) {
    console.error("getUserByUserNameFromDatabase hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const getUserByID = async (req, res) => {
  console.info("getUserByID: Kullanıcı ID ile aranıyor.");
  const id = req.params.id;
  try {
    const bilgiler = await User.findById(
      { _id: id },
      "userName role createdAt"
    );
    if (!bilgiler) {
      console.info("getUserByID: Kullanıcı bulunamadı, ID:", id);
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    console.info("getUserByID: Kullanıcı getirildi, ID:", id);
    res.json({
      message: "Bireysel kullanıcı bilgileriniz",
      data: bilgiler,
    });
  } catch (error) {
    console.error("getUserByID hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const deleteUserFromDatabase = async (req, res) => {
  const username = req.params.username;
  if (!username) {
    console.error("deleteUserFromDatabase: Username sağlanmadı.");
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const result = await User.deleteOne({ userName: username });
    if (result.deletedCount === 0) {
      console.info("deleteUserFromDatabase: Kullanıcı bulunamadı:", username);
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    console.info("deleteUserFromDatabase: Kullanıcı silindi:", username);
    res.status(201).send("User has been deleted successfully");
  } catch (error) {
    console.error("deleteUserFromDatabase hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const deleteUserByID = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    console.error("deleteUserByID: ID sağlanmadı.");
    return res.status(400).json({ message: "ID is required" });
  }
  try {
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      console.info("deleteUserByID: Kullanıcı bulunamadı, ID:", id);
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    console.info("deleteUserByID: Kullanıcı silindi, ID:", id);
    res.status(201).send("User has been deleted successfully");
  } catch (error) {
    console.error("deleteUserByID hata:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const deleteAllUsersFromDatabase = async (req, res) => {
  const delete_confirm = req.body.delete_confirm;
  try {
    if (delete_confirm === "DELETE ALL USER") {
      const result = await User.deleteMany({});
      console.info(
        "deleteAllUsersFromDatabase: Tüm kullanıcılar silindi, sayısı:",
        result.deletedCount
      );
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} kullanıcı silindi.`,
      });
    } else {
      console.info("deleteAllUsersFromDatabase: Silme işlemi iptal edildi.");
      res.status(400).json({
        success: false,
        message: "Sanırım silmekten vazgeçtiniz ",
      });
    }
  } catch (error) {
    console.error("deleteAllUsersFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcılar silinirken bir hata oluştu.",
      error: error.message,
    });
  }
};

const updateUserFromDatabase = async (req, res) => {
  console.info("updateUserFromDatabase: Kullanıcı güncelleme işlemi başladı.");
  const username = req.params.username;
  const updatedData = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { userName: username },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.info("updateUserFromDatabase: Kullanıcı bulunamadı:", username);
      return res.status(404).send("User not found");
    }

    console.info("updateUserFromDatabase: Kullanıcı güncellendi:", username);
    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("updateUserFromDatabase hata:", error);
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
