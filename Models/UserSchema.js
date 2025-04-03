const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500, // Kullanıcı biyografisi
    },
    profileImage: {
      type: String, // Bir URL olabilir
      default:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y", // Yeni varsayılan fotoğraf
    },
    occupation: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
    },
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
    },
    role: {
      type: String,
      enum: ["user", "author", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false, // E-posta doğrulandı mı
    },
    isActive: {
      type: Boolean,
      default: true, // Kullanıcı hesabı aktif mi
    },
    verificationToken: {
      type: String,
      default: "",
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete için kullanılabilir
    },
  },
  { timestamps: true }
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
