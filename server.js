const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDatabase = require("./Helpers/connectDatabase");
const router = require("./Routers/index");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

// CORS ayarları - env dosyasından origins alınıyor
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // Cookie gönderimine izin verir
  })
);

// json formayına dönüştürmek için gerekli olan kodlar
app.use(express.json({ limit: "50mb" })); // JSON için 50MB'a çıkar
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("Finance blog");
});
app.use("/blog", router);

// Database connection
connectDatabase();

// app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack); // Hatanın detaylarını loglar
  res.status(500).json({
    success: false,
    message: "Bir hata oluştu, lütfen daha sonra tekrar deneyin.", // Kullanıcıya gösterilen mesaj
    error: err.message, // Geliştiriciler için daha detaylı hata mesajı (isteğe bağlı)
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`Server accessible at http://localhost:${port}`);
});
