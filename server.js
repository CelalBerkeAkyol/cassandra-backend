const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDatabase = require("./Helpers/connectDatabase");
const router = require("./Routers/index");
const cookieParser = require("cookie-parser");
const { connectRedis } = require("./Helpers/redisHelper");
const { connectKafka } = require("./Helpers/kafkaHelper");

const app = express();
const port = process.env.PORT || 3000;

// CORS ayarları - env dosyasından origins alınıyor
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const isDevelopment = process.env.NODE_ENV !== "production";

console.log("ALLOWED_ORIGINS:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("isDevelopment:", isDevelopment);

// CORS ayarları güncellemesi
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming request origin:", origin);
      // Tarayıcıdan olmayan (null origin) veya izin verilen originler için izin ver
      // Development modunda tüm originler için izin ver
      if (isDevelopment || !origin || allowedOrigins.indexOf(origin) !== -1) {
        console.log("CORS allowed for origin:", origin);
        callback(null, true);
      } else {
        console.warn(
          "CORS denied for origin:",
          origin,
          "Allowed origins:",
          allowedOrigins
        );
        callback(new Error("CORS policy: Not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true, // Cookie gönderimine izin verir
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Refresh-Token",
      "x-csrf-token",
    ],
    exposedHeaders: ["Set-Cookie", "x-csrf-token"],
    optionsSuccessStatus: 200,
  })
);

// json formayına dönüştürmek için gerekli olan kodlar
app.use(express.json({ limit: "50mb" })); // JSON için 50MB'a çıkar
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Geliştirme ortamı için HTTPS gereksinimini devre dışı bırakma middleware'i
app.use((req, res, next) => {
  // Secure cookie durumlarını kontrol etmek için
  console.log(`Request from: ${req.headers.origin} to ${req.path}`);

  // Orijinal res.cookie fonksiyonunu sakla
  const originalCookie = res.cookie;

  // Geliştirme ortamında ve HTTP kullanıyorsa secure: false yap
  if (isDevelopment) {
    res.cookie = function (name, value, options = {}) {
      // Geliştirme ortamı için secure özelliğini false yapabiliriz
      if (options.secure && !req.secure && req.protocol === "http") {
        console.log(`Setting insecure cookie ${name} for HTTP development`);
        options.secure = false;
      }
      return originalCookie.call(this, name, value, options);
    };
  }

  next();
});

// Ana rota
app.get("/", (req, res) => {
  res.send("Cassandra API");
});
app.use("/api", router);

// Database connection
connectDatabase();

// Redis Connection
connectRedis();

// Kafka Connection
connectKafka().catch((err) => console.error("Kafka connection failed:", err));

app.use((err, req, res, next) => {
  console.error(err.stack); // Hatanın detaylarını loglar
  res.status(500).json({
    success: false,
    message: "Bir hata oluştu, lütfen daha sonra tekrar deneyin.", // Kullanıcıya gösterilen mesaj
    error: err.message, // Geliştiriciler için daha detaylı hata mesajı (isteğe bağlı)
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server accessible at http://localhost:${port}`);
  console.log(
    `Running in ${isDevelopment ? "development" : "production"} mode`
  );
});
