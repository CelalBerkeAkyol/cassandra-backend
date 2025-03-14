const mongoose = require("mongoose");
const User = require("../Models/UserSchema");

const getAllUserFromDatabase = async (req, res) => {
  console.info(
    "user/getAllUserFromDatabase: Tüm kullanıcılar getirilmeye çalışılıyor."
  );
  try {
    const userList = await User.find({});
    if (userList.length === 0) {
      console.info("user/getAllUserFromDatabase: Hiç kullanıcı bulunamadı.");
      return res.status(404).json({
        success: false,
        message: "Hiç kullanıcı bulunamadı",
        error: {
          code: "NO_USERS",
          details: ["Veritabanında hiç kullanıcı bulunmuyor."],
        },
      });
    }
    console.info(
      `user/getAllUserFromDatabase: ${userList.length} kullanıcı getirildi.`
    );
    res.status(200).json({
      success: true,
      message: "Tüm kullanıcılar başarıyla getirildi",
      data: userList,
    });
  } catch (error) {
    console.error("user/getAllUserFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcılar getirilirken bir hata oluştu."],
      },
    });
  }
};

const getUserByUserNameFromDatabase = async (req, res) => {
  console.info(
    "user/getUserByUserNameFromDatabase: Kullanıcı araması başladı."
  );
  const username = req.params.username;
  try {
    const userList = await User.findOne(
      { userName: username },
      "userName role createdAt"
    );
    if (!userList) {
      console.info(
        "user/getUserByUserNameFromDatabase: Kullanıcı bulunamadı:",
        username
      );
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
        error: {
          code: "USER_NOT_FOUND",
          details: ["Bu kullanıcı adı ile kayıtlı kullanıcı bulunamadı."],
        },
      });
    }

    console.info(
      "user/getUserByUserNameFromDatabase: Kullanıcı getirildi:",
      username
    );
    res.status(200).json({
      success: true,
      message: "Kullanıcı bilgileri başarıyla getirildi",
      data: userList,
    });
  } catch (error) {
    console.error("user/getUserByUserNameFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı bilgileri getirilirken bir hata oluştu."],
      },
    });
  }
};

const getUserByID = async (req, res) => {
  console.info("user/getUserByID: Kullanıcı ID ile aranıyor.");
  const id = req.params.id;

  if (!id) {
    console.error("user/getUserByID: ID sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Kullanıcı ID'si gereklidir",
      error: {
        code: "MISSING_ID",
        details: ["Kullanıcı ID'si belirtilmedi."],
      },
    });
  }

  try {
    // Geçerli bir MongoDB ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("user/getUserByID: Geçersiz ID formatı:", id);
      return res.status(400).json({
        success: false,
        message: "Geçersiz kullanıcı ID formatı",
        error: {
          code: "INVALID_ID",
          details: ["Girilen ID formatı geçersiz."],
        },
      });
    }

    // Daha fazla kullanıcı bilgisi getirmek için select kısmını güncelliyoruz
    const userList = await User.findById(
      { _id: id },
      "userName fullName email bio profileImage occupation website socialLinks role isVerified createdAt"
    );

    if (!userList) {
      console.info("user/getUserByID: Kullanıcı bulunamadı, ID:", id);
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
        error: {
          code: "USER_NOT_FOUND",
          details: ["Bu ID ile kayıtlı kullanıcı bulunamadı."],
        },
      });
    }

    console.info("user/getUserByID: Kullanıcı getirildi, ID:", id);
    res.status(200).json({
      success: true,
      message: "Kullanıcı bilgileri başarıyla getirildi",
      data: userList,
    });
  } catch (error) {
    console.error("user/getUserByID hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı bilgileri getirilirken bir hata oluştu."],
      },
    });
  }
};

const deleteUserFromDatabase = async (req, res) => {
  const username = req.params.username;
  if (!username) {
    console.error("user/deleteUserFromDatabase: Username sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Username is required",
      error: {
        code: "MISSING_USERNAME",
        details: ["Kullanıcı adı belirtilmedi."],
      },
    });
  }
  try {
    const result = await User.deleteOne({ userName: username });
    if (result.deletedCount === 0) {
      console.info(
        "user/deleteUserFromDatabase: Kullanıcı bulunamadı:",
        username
      );
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
        error: {
          code: "USER_NOT_FOUND",
          details: ["Bu kullanıcı adı ile kayıtlı kullanıcı bulunamadı."],
        },
      });
    }
    console.info("user/deleteUserFromDatabase: Kullanıcı silindi:", username);
    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
      data: null,
    });
  } catch (error) {
    console.error("user/deleteUserFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı silinirken bir hata oluştu."],
      },
    });
  }
};

const deleteUserByID = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    console.error("user/deleteUserByID: ID sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "ID is required",
      error: {
        code: "MISSING_ID",
        details: ["Kullanıcı ID'si belirtilmedi."],
      },
    });
  }
  try {
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      console.info("user/deleteUserByID: Kullanıcı bulunamadı, ID:", id);
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
        error: {
          code: "USER_NOT_FOUND",
          details: ["Bu ID ile kayıtlı kullanıcı bulunamadı."],
        },
      });
    }
    console.info("user/deleteUserByID: Kullanıcı silindi, ID:", id);
    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
      data: null,
    });
  } catch (error) {
    console.error("user/deleteUserByID hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı silinirken bir hata oluştu."],
      },
    });
  }
};

const deleteAllUsersFromDatabase = async (req, res) => {
  const delete_confirm = req.body.delete_confirm;
  try {
    if (delete_confirm === "DELETE ALL USER") {
      const result = await User.deleteMany({});
      console.info(
        "user/deleteAllUsersFromDatabase: Tüm kullanıcılar silindi, sayısı:",
        result.deletedCount
      );
      res.status(200).json({
        success: true,
        message: "Tüm kullanıcılar başarıyla silindi",
        data: {
          deletedCount: result.deletedCount,
        },
      });
    } else {
      console.info(
        "user/deleteAllUsersFromDatabase: Silme işlemi iptal edildi."
      );
      res.status(400).json({
        success: false,
        message: "Silme işlemi iptal edildi",
        error: {
          code: "DELETE_CANCELLED",
          details: ["Silme işlemi onaylanmadı."],
        },
      });
    }
  } catch (error) {
    console.error("user/deleteAllUsersFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcılar silinirken bir hata oluştu."],
      },
    });
  }
};

const updateUserFromDatabase = async (req, res) => {
  console.info(
    "user/updateUserFromDatabase: Kullanıcı güncelleme işlemi başladı."
  );
  const id = req.params.id;
  const updatedData = req.body;

  if (!id) {
    console.error("user/updateUserFromDatabase: ID sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Kullanıcı ID'si gereklidir",
      error: {
        code: "MISSING_ID",
        details: ["Kullanıcı ID'si belirtilmedi."],
      },
    });
  }

  // Geçerli bir MongoDB ObjectId kontrolü
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("user/updateUserFromDatabase: Geçersiz ID formatı:", id);
    return res.status(400).json({
      success: false,
      message: "Geçersiz kullanıcı ID formatı",
      error: {
        code: "INVALID_ID",
        details: ["Girilen ID formatı geçersiz."],
      },
    });
  }

  // Güvenlik için şifre alanını kaldır
  if (updatedData.password) {
    delete updatedData.password;
  }

  // Güvenlik için rol alanını kaldır (rol değişikliği sadece updateUserRole ile yapılabilir)
  if (updatedData.role) {
    delete updatedData.role;
  }

  // Güvenlik için email değişikliğini engelle
  if (updatedData.email) {
    delete updatedData.email;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select(
      "userName fullName email bio profileImage occupation website socialLinks role isVerified createdAt"
    );

    if (!updatedUser) {
      console.info(
        "user/updateUserFromDatabase: Kullanıcı bulunamadı, ID:",
        id
      );
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
        error: {
          code: "USER_NOT_FOUND",
          details: ["Bu ID ile kayıtlı kullanıcı bulunamadı."],
        },
      });
    }

    console.info("user/updateUserFromDatabase: Kullanıcı güncellendi, ID:", id);
    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla güncellendi",
      data: updatedUser,
    });
  } catch (error) {
    console.error("user/updateUserFromDatabase hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı güncellenirken bir hata oluştu."],
      },
    });
  }
};

const updateUserRole = async (req, res) => {
  console.info("user/updateUserRole: Kullanıcı rol güncelleme işlemi başladı.");
  const userId = req.params.id;
  const { role } = req.body;

  if (!role) {
    console.error("user/updateUserRole: Rol bilgisi sağlanmadı.");
    return res.status(400).json({
      success: false,
      message: "Rol bilgisi gereklidir.",
    });
  }

  // Geçerli rol kontrolü
  const validRoles = ["user", "author", "admin"];
  if (!validRoles.includes(role)) {
    console.error("user/updateUserRole: Geçersiz rol:", role);
    return res.status(400).json({
      success: false,
      message: "Geçersiz rol. Geçerli roller: user, author, admin",
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.info("user/updateUserRole: Kullanıcı bulunamadı, ID:", userId);
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı.",
      });
    }

    console.info(
      "user/updateUserRole: Kullanıcı rolü güncellendi, ID:",
      userId,
      "Yeni rol:",
      role
    );
    res.status(200).json({
      success: true,
      message: "Kullanıcı rolü başarıyla güncellendi.",
      data: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("user/updateUserRole hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: error.message,
    });
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
  updateUserRole,
};
