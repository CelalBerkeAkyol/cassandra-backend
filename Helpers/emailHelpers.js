const nodemailer = require("nodemailer");
const crypto = require("crypto");

const sendVerificationEmail = async (user, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        email: process.env.GOOGLE_MAIL,
        password: process.env.GOOGLE_PASS,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const mailOptions = {
      from: process.env.GOOGLE_MAIL,
      to: user.email,
      subject: "Verify your Email | Fin AI",
      text: `Please verify your email by clicking this link : \n${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/verify-email?token=${token}\n\nLink expires in 2 hours\n\nFin Ai`,
    };

    user.verificationToken = token;
    user.verificationTokenExpiresAt = Date.now() + 2 * 36000000; // 2 hours

    await transporter.sendMail(mailOptions, (err, res) => {
      if (err) throw new Error("Sending verification email failed");
    });
    await user.save();
  } catch (error) {
    console.error("auth/sendVerification Email hata:", error);
    res.status(400).json({
      success: false,
      message: "Doğrulama e-postası gönderilemedi",
    });
  }
};

module.exports = { sendVerificationEmail };
