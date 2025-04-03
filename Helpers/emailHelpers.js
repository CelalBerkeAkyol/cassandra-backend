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

module.exports = { sendVerificationEmail };
