const nodemailer = require("nodemailer");
const crypto = require("crypto");

const sendVerificationEmail = async (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_PASS,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpiresAt = Date.now() + 2 * 3600000; // 2 hours

    const mailOptions = {
      from: process.env.GOOGLE_MAIL,
      to: user.email,
      subject: "Verify your Email | Fin AI",
      text: `Please verify your email by clicking this link: \n${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/verify-email?token=${token}\n\nLink expires in 2 hours\n\nFin Ai`,
    };

    await transporter.sendMail(mailOptions);
    await user.save();

    return { token, expiresAt: user.verificationTokenExpiresAt };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Doğrulama e-postası gönderilemedi");
  }
};

const sendPasswordResetEmail = async (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_PASS,
      },
    });

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.createHash("sha256").update(resetCode).digest("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60000; // 15 minutes
    user.resetPasswordAttempts = 0;

    const mailOptions = {
      from: process.env.GOOGLE_MAIL,
      to: user.email,
      subject: "Password Reset | Fin AI",
      text: `You requested a password reset for your Fin AI account.\n\nYour verification code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nFin AI`,
    };

    await transporter.sendMail(mailOptions);
    await user.save();

    return { expiresAt: user.resetPasswordExpires };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Şifre sıfırlama e-postası gönderilemedi");
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
