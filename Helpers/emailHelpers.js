const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    email: process.env.GOOGLE_MAIL,
    password: process.env.GOOGLE_PASS,
  },
});

const sendVerificationEmail = async (user, res) => {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_MAIL,
      to: user.email,
      subject: "Verify your Email | Fin AI",
      text: `Please verify your email by clicking this link : \n${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/verify-email?token=${token}`,
    };
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpiresAt = await transporter.sendMail(mailOptions);
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Doğrulama e-postası gönderilemedi" });
  }
};

module.exports = { sendVerificationEmail };
