const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDatabase = require("./Helpers/connectDatabase");
const router = require("./Routers/index");

const app = express();
const port = 3000;

app.use(cors());
// json formayına dönüştürmek için gerekli olan kodlar
app.use(express.json()); // json formatına çeviriyor
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", router);

// Database connection
connectDatabase();
// app.use(express.json());
// app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack); // Hatanın detaylarını loglar
  res.status(500).json({
    success: false,
    message: "Bir hata oluştu, lütfen daha sonra tekrar deneyin.", // Kullanıcıya gösterilen mesaj
    error: err.message, // Geliştiriciler için daha detaylı hata mesajı (isteğe bağlı)
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
