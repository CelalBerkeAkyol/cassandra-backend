const Image = require("../Models/ImageSchema");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Görsel dosyası bulunamadı." });
    }

    // Yüklenen dosyanın URL'si oluşturuluyor.
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const { altText } = req.body;
    if (!altText) {
      return res
        .status(400)
        .json({ error: "Lütfen resim açıklaması giriniz." });
    }

    const image = new Image({
      url: imageUrl,
      altText,
    });

    await image.save();

    return res
      .status(201)
      .json({ message: "Görsel başarıyla yüklendi.", image });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
