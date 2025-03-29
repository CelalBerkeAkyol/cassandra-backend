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

// Soft Delete: Kullanıcıyı deaktif eder, veriler silinmez
const softDeleteUserByID = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user.id;

  if (!id) {
    console.error("user/softDeleteUserByID: ID sağlanmadı.");
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
    console.error("user/softDeleteUserByID: Geçersiz ID formatı:", id);
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
    let userToDeactivate;
    try {
      userToDeactivate = await User.findById(id);

      if (!userToDeactivate) {
        console.info("user/softDeleteUserByID: Kullanıcı bulunamadı, ID:", id);
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
        "user/softDeleteUserByID: Kullanıcı bulunurken hata oluştu:",
        findError
      );
      return res.status(500).json({
        success: false,
        message: "Kullanıcı bulunurken bir hata oluştu",
        error: {
          code: "FIND_ERROR",
          details: ["Veritabanı işlemi sırasında bir hata oluştu."],
        },
      });
    }

    // MongoDB ObjectID'lerini string'e çevirip karşılaştır
    const isCurrentUser =
      userToDeactivate &&
      userToDeactivate._id &&
      currentUserId &&
      userToDeactivate._id.toString() === currentUserId.toString();

    console.info(
      `user/softDeleteUserByID: isCurrentUser kontrol edildi. Mevcut kullanıcı: ${currentUserId}, Deaktif edilen kullanıcı: ${id}, Sonuç: ${isCurrentUser}`
    );

    // Kullanıcıyı deaktif et
    let result;
    try {
      result = await User.findByIdAndUpdate(
        id,
        {
          isActive: false,
          deletedAt: new Date(),
          // Eğer kullanıcı kendi hesabını deaktif ediyorsa refresh token'ı temizle
          ...(isCurrentUser ? { refreshToken: null } : {}),
        },
        { new: true }
      );

      if (!result) {
        console.info(
          "user/softDeleteUserByID: Kullanıcı deaktif edilirken hata oluştu, ID:",
          id
        );
        return res.status(500).json({
          success: false,
          message: "Kullanıcı deaktif edilemedi",
          error: {
            code: "DEACTIVATE_FAILED",
            details: ["Kullanıcı deaktif edilemedi. Lütfen tekrar deneyin."],
          },
        });
      }
    } catch (deactivateError) {
      console.error(
        "user/softDeleteUserByID: Kullanıcı deaktif etme hatası:",
        deactivateError
      );
      return res.status(500).json({
        success: false,
        message: "Kullanıcı deaktif edilirken bir hata oluştu",
        error: {
          code: "DEACTIVATE_ERROR",
          details: ["Veritabanı işlemi sırasında bir hata oluştu."],
        },
      });
    }

    console.info("user/softDeleteUserByID: Kullanıcı deaktif edildi, ID:", id);

    // Add a flag to indicate if the deleted user is the current user
    const responseData = {
      isCurrentUser: isCurrentUser,
      userName: userToDeactivate ? userToDeactivate.userName : "Kullanıcı",
    };

    // Eğer deaktif edilen kullanıcı oturum açmış kullanıcı ise çerezleri temizle
    if (isCurrentUser) {
      console.info(
        "user/softDeleteUserByID: Mevcut kullanıcı deaktif edildi, çerezler temizleniyor"
      );
      clearAuthCookies(res);
    }

    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla deaktif edildi",
      data: responseData,
    });
  } catch (error) {
    console.error("user/softDeleteUserByID hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
      error: {
        code: "SERVER_ERROR",
        details: ["Kullanıcı deaktif edilirken bir hata oluştu."],
      },
    });
  }
};

// Hard Delete: Kullanıcıyı veritabanından tamamen siler
const hardDeleteUserByID = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user.id;

  if (!id) {
    console.error("user/hardDeleteUserByID: ID sağlanmadı.");
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
    console.error("user/hardDeleteUserByID: Geçersiz ID formatı:", id);
    return res.status(400).json({
      success: false,
      message: "Geçersiz kullanıcı ID formatı",
      error: {
        code: "INVALID_ID",
        details: ["Girilen ID formatı geçersiz."],
      },
    });
  }

  // Sadece admin kullanıcılar hard delete yapabilir
  if (req.user.role !== "admin") {
    console.error(
      "user/hardDeleteUserByID: Yetkisiz işlem, sadece admin yapabilir"
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

  try {
    // Before deletion, get the user data for cleanup
    let userToDelete;
    try {
      userToDelete = await User.findById(id);

      if (!userToDelete) {
        console.info("user/hardDeleteUserByID: Kullanıcı bulunamadı, ID:", id);
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
        "user/hardDeleteUserByID: Kullanıcı bulunurken hata oluştu:",
        findError
      );
      return res.status(500).json({
        success: false,
        message: "Kullanıcı bulunurken bir hata oluştu",
        error: {
          code: "FIND_ERROR",
          details: ["Veritabanı işlemi sırasında bir hata oluştu."],
        },
      });
    }

    // MongoDB ObjectID'lerini string'e çevirip karşılaştır
    const isCurrentUser =
      userToDelete &&
      userToDelete._id &&
      currentUserId &&
      userToDelete._id.toString() === currentUserId.toString();

    // Kendini silmeye çalışan admin kontrolü
    if (isCurrentUser) {
      console.error(
        "user/hardDeleteUserByID: Admin kendi hesabını silmeye çalışıyor, işlem durduruldu"
      );
      return res.status(400).json({
        success: false,
        message:
          "Kendi hesabınızı tamamen silemezsiniz. Önce başka bir admin oluşturun.",
        error: {
          code: "SELF_DELETE_NOT_ALLOWED",
          details: ["Admin kullanıcılar kendi hesaplarını tamamen silemezler."],
        },
      });
    }

    // Kullanıcıyı kalıcı olarak sil
    const deleteResult = await User.findByIdAndDelete(id);

    if (!deleteResult) {
      console.info(
        "user/hardDeleteUserByID: Kullanıcı silinirken hata oluştu, ID:",
        id
      );
      return res.status(500).json({
        success: false,
        message: "Kullanıcı silinemedi",
        error: {
          code: "DELETE_FAILED",
          details: ["Kullanıcı silinemedi. Lütfen tekrar deneyin."],
        },
      });
    }

    console.info("user/hardDeleteUserByID: Kullanıcı tamamen silindi, ID:", id);

    // Yanıt döndür
    res.status(200).json({
      success: true,
      message: "Kullanıcı veritabanından tamamen silindi",
      data: {
        isHardDeleted: true,
        userName: userToDelete.userName || "Kullanıcı",
      },
    });
  } catch (error) {
    console.error("user/hardDeleteUserByID hata:", error);
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
  softDeleteUserByID,
  hardDeleteUserByID,
  updateUserRole,
  getAuthorsAndAdmins,
  toggleUserActivation,
};
