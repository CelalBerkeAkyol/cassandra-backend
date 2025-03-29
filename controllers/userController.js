const mongoose = require("mongoose");
const User = require("../Models/UserSchema");
const { clearAuthCookies } = require("../Helpers/tokenHelpers");

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

const deleteUserByID = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user.id; // Get the current user's ID for comparison

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

  // Geçerli MongoDB ID kontrolü yap
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("user/deleteUserByID: Geçersiz ID formatı:", id);
    return res.status(400).json({
      success: false,
      message: "Geçersiz kullanıcı ID formatı",
      error: {
        code: "INVALID_ID",
        details: ["Girilen ID formatı geçersiz."],
      },
    });
  }

  try {
    // Before deletion, get the user data for cleanup
    let userToDelete;
    try {
      userToDelete = await User.findById(id);

      if (!userToDelete) {
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
    } catch (findError) {
      console.error(
        "user/deleteUserByID: Kullanıcı bulunurken hata oluştu:",
        findError
      );
      // Kullanıcı bulunamadı ama silme işlemine devam edebiliriz
      userToDelete = null;
    }

    // Silmek yerine kullanıcıyı deaktif et
    let result;
    try {
      result = await User.findByIdAndUpdate(
        id,
        {
          isActive: false,
          deletedAt: new Date(),
          refreshToken: null, // Tüm yenileme tokenlarını geçersiz kıl
        },
        { new: true }
      );

      if (!result) {
        console.info(
          "user/deleteUserByID: Kullanıcı deaktif edilirken hata oluştu, ID:",
          id
        );
        return res.status(500).json({
          success: false,
          message: "Kullanıcı deaktif edilemedi",
          error: {
            code: "DELETE_FAILED",
            details: ["Kullanıcı deaktif edilemedi. Lütfen tekrar deneyin."],
          },
        });
      }
    } catch (deleteError) {
      console.error(
        "user/deleteUserByID: Kullanıcı deaktif etme hatası:",
        deleteError
      );
      return res.status(500).json({
        success: false,
        message: "Kullanıcı deaktif edilirken bir hata oluştu",
        error: {
          code: "DELETE_ERROR",
          details: ["Veritabanı işlemi sırasında bir hata oluştu."],
        },
      });
    }

    console.info("user/deleteUserByID: Kullanıcı deaktif edildi, ID:", id);

    // MongoDB ObjectID'lerini string'e çevirip karşılaştır
    // veya mongoose'un equals metodunu kullan
    const isCurrentUser =
      userToDelete &&
      userToDelete._id &&
      currentUserId &&
      userToDelete._id.toString() === currentUserId.toString();

    console.info(
      `user/deleteUserByID: isCurrentUser kontrol edildi. Mevcut kullanıcı: ${currentUserId}, Silinen kullanıcı: ${id}, Sonuç: ${isCurrentUser}`
    );

    // Add a flag to indicate if the deleted user is the current user
    const responseData = {
      isCurrentUser: isCurrentUser,
      userName: userToDelete ? userToDelete.userName : "Kullanıcı",
    };

    // Her durumda auth çerezlerini temizleyelim - silinen kullanıcının tarayıcısında
    // bu işleme yaramayacak ama admin kendi hesabını siliyorsa işe yarar
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
      data: responseData,
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

      // Kullanıcı bulunamadı - çerezleri temizle
      console.info(
        "user/updateUserFromDatabase: Kullanıcı bulunamadığı için çerezler temizleniyor"
      );
      clearAuthCookies(res);

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

      // Kullanıcı bulunamadı - çerezleri temizle
      console.info(
        "user/updateUserRole: Kullanıcı bulunamadığı için çerezler temizleniyor"
      );
      clearAuthCookies(res);

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

const getAuthorsAndAdmins = async (req, res) => {
  console.info(
    "user/getAuthorsAndAdmins: Admin ve Yazar kullanıcılar getiriliyor."
  );
  try {
    // Find users with role of either 'author' or 'admin'
    const teamMembers = await User.find({
      role: { $in: ["author", "admin"] },
    }).select(
      "userName fullName email profileImage bio occupation website socialLinks role createdAt isVerified"
    );

    if (teamMembers.length === 0) {
      console.info(
        "user/getAuthorsAndAdmins: Hiç yazar veya admin bulunamadı."
      );
      return res.status(404).json({
        success: false,
        message: "Hiç yazar veya admin bulunamadı",
        error: {
          code: "NO_TEAM_MEMBERS",
          details: ["Veritabanında hiç yazar veya admin bulunmuyor."],
        },
      });
    }

    console.info(
      `user/getAuthorsAndAdmins: ${teamMembers.length} yazar ve admin getirildi.`
    );
    res.status(200).json({
      success: true,
      message: "Tüm yazarlar ve adminler başarıyla getirildi",
      data: teamMembers,
    });
  } catch (error) {
    console.error("user/getAuthorsAndAdmins hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Yazarlar ve adminler getirilirken bir hata oluştu."],
      },
    });
  }
};

// Kullanıcı aktivasyon durumunu değiştirme (admin için)
const toggleUserActivation = async (req, res) => {
  console.info(
    "user/toggleUserActivation: Kullanıcı aktivasyon durumu değiştiriliyor."
  );
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Admin yetkisi kontrolü
    if (req.user.role !== "admin") {
      console.error(
        "user/toggleUserActivation: Yetkisiz erişim, kullanıcı admin değil"
      );
      return res.status(403).json({
        success: false,
        message: "Bu işlem için admin yetkisine sahip olmanız gerekiyor",
        error: {
          code: "UNAUTHORIZED_ACCESS",
          details: [
            "Bu işlemi sadece admin rolüne sahip kullanıcılar yapabilir.",
          ],
        },
      });
    }

    // ID kontrolü
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("user/toggleUserActivation: Geçersiz ID formatı:", userId);
      return res.status(400).json({
        success: false,
        message: "Geçersiz kullanıcı ID'si",
        error: {
          code: "INVALID_ID",
          details: ["Girilen ID formatı geçersiz."],
        },
      });
    }

    // İstek gövdesinde isActive alanının varlığını kontrol et
    if (isActive === undefined) {
      console.error(
        "user/toggleUserActivation: Aktivasyon durumu belirtilmedi"
      );
      return res.status(400).json({
        success: false,
        message: "Aktivasyon durumu belirtilmedi",
        error: {
          code: "MISSING_FIELD",
          details: ["isActive alanı gereklidir."],
        },
      });
    }

    // Kullanıcıyı bul ve güncelle
    const user = await User.findById(userId);

    if (!user) {
      console.info(
        "user/toggleUserActivation: Kullanıcı bulunamadı, ID:",
        userId
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

    // Kullanıcının aktivasyon durumunu güncelle
    user.isActive = isActive;
    await user.save();

    console.info(
      `user/toggleUserActivation: Kullanıcı ${
        isActive ? "aktifleştirildi" : "deaktif edildi"
      }, ID: ${userId}`
    );

    // Başarılı yanıt
    return res.status(200).json({
      success: true,
      message: `Kullanıcı ${isActive ? "aktifleştirildi" : "deaktif edildi"}`,
      data: user,
    });
  } catch (error) {
    console.error("user/toggleUserActivation hata:", error);
    return res.status(500).json({
      success: false,
      message: "Kullanıcı aktivasyon durumu güncellenirken bir hata oluştu",
      error: {
        code: "SERVER_ERROR",
        details: ["Veritabanı işlemi sırasında bir hata oluştu."],
      },
    });
  }
};

module.exports = {
  getAllUserFromDatabase,
  deleteAllUsersFromDatabase,
  updateUserFromDatabase,
  getUserByUserNameFromDatabase,
  getUserByID,
  deleteUserByID,
  updateUserRole,
  getAuthorsAndAdmins,
  toggleUserActivation,
};
