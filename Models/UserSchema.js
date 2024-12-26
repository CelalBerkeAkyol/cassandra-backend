const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Kullanıcı şeması
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["author", "admin"],
      default: "author",
    },
    refreshToken: {
      type: String,
      default: null, // Varsayılan olarak null
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik oluşturur
  }
);

// ------ Şema Fonksiyonları -------

// Şifre hashleme (kaydetmeden önce)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Şifre doğrulama
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Kullanıcı modelini dışa aktar
module.exports = mongoose.model("User", userSchema);
