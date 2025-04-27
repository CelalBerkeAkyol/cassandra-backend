const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Gmail yerine SMTP kullanarak yeni e-posta adresini kullanın
const createTransporter = () => {
  console.log("SMTP login olacak kullanıcı:", process.env.GOOGLE_MAIL);
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL kullanımı
    auth: {
      user: process.env.GOOGLE_MAIL,
      pass: process.env.GOOGLE_PASS,
    },
  });
};

const sendVerificationEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpiresAt = Date.now() + 2 * 3600000; // 2 hours

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : process.env.FRONTEND_URL;

    // HTML email template with better styling
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-posta Doğrulama</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #eaeaea;
          border-radius: 8px;
        }
        .header {
          background-color: #6366F1;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          background-color: #fff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #6366F1;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>E-posta Adresinizi Doğrulayın</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Fin AI hesabınızı oluşturduğunuz için teşekkür ederiz. E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center;">
            <a href="${baseUrl}/verify-email?token=${token}" class="button">E-posta Adresimi Doğrula</a>
          </div>
          <p>Veya aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:</p>
          <p>${baseUrl}/verify-email?token=${token}</p>
          <p>Bu bağlantı 2 saat içinde geçerliliğini yitirecektir.</p>
          <p>Eğer bu hesabı siz oluşturmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Cassandra tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: "noreply@cassandra.com.tr",
      to: user.email,
      subject: "E-posta Doğrulama | Cassandra ",
      text: `E-posta adresinizi doğrulamak için lütfen bu bağlantıya tıklayın: ${baseUrl}/verify-email?token=${token}\n\nBağlantı 2 saat içinde geçerliliğini yitirecektir.\n\nCassandra Blog`,
      html: htmlContent,
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
    const transporter = createTransporter();

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.createHash("sha256").update(resetCode).digest("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1 * 60000; // 1 minute
    user.resetPasswordAttempts = 0;

    // HTML email template with better styling
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Şifre Sıfırlama</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6366F1;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 24px;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #eaeaea;
          border-top: none;
        }
        .code-container {
          background-color: #ffffff;
          border: 1px dashed #ddd;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #6366F1;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #999;
        }
        .button {
          display: inline-block;
          background-color: #6366F1;
          color:rgb(255, 255, 255);
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin-top: 15px;
          font-weight: bold;
        }
        .warning {
          background-color: #FEF2F2;
          border-left: 4px solid #EF4444;
          padding: 10px 15px;
          margin-top: 20px;
          font-size: 14px;
          color: #B91C1C;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki doğrulama kodunu kullanın:</p>
          
          <div class="code-container">
            <div class="code">${resetCode}</div>
          </div>
          
          <p>Bu kod <strong>1 dakika</strong> içinde geçerliliğini yitirecektir.</p>
          
          <p>Şifrenizi sıfırlamak için şifre sıfırlama sayfasında bu kodu kullanın.</p>
          
          <div class="warning">
            <p>Eğer bu işlemi siz talep etmediyseniz, bu e-postayı görmezden gelebilirsiniz. Hesabınızın güvenliği için şifreniz değiştirilmeyecektir.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Cassandra tüm hakları saklıdır.</p>
          <p>Bu e-posta otomatik olarak oluşturulmuştur, lütfen yanıtlamayınız.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: "noreply@cassandra.com.tr",
      to: user.email,
      subject: "Şifre Sıfırlama | Cassandra",
      text: `Cassandra hesabınız için şifre sıfırlama talebinde bulundunuz.\n\nDoğrulama kodunuz: ${resetCode}\n\nBu kod 1 dakika içinde geçerliliğini yitirecektir.\n\nŞifrenizi sıfırlamak için şifre sıfırlama sayfasında bu kodu kullanın.\n\nEğer bu işlemi siz talep etmediyseniz, bu e-postayı görmezden gelebilirsiniz.\n\nCassandra Blog`,
      html: htmlContent,
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
