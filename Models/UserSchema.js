const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// bir kullanıcının hangi verileri olacak ve saklanacak
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  userName: String,
  lastName: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  refreshToken: {
    type: String,
    default: " ",
  },
});
// ------ fonksiyonlar -------

// Şifre hashlama
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", userSchema); // dışarıya collection çıkartır
