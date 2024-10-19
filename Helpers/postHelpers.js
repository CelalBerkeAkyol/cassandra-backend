const Post = require("../Models/PostSchema");

// categorileri veri tabanından çeker
const getAllCategory = async (req, res) => {
  const allCategory = await Post.schema.path("category").enumValues;
  res.json({
    success: true,
    text: "Bütün kategori bunlardır",
    allCategory,
  });
};
//statusleri veri tabanından çeker
const gettAllStatus = async (req, res) => {
  const allStatus = await Post.schema.path("status").enumValues;
  res.json({
    success: true,
    text: "Bütün postlar bunlardır",
    allStatus,
  });
};
module.exports = { getAllCategory, gettAllStatus };
