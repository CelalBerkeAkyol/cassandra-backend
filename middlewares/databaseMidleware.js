const Post = require("../Models/PostSchema");
const checkPostId = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return next(Error("Bu idye ait bir post bulunmamaktadır"));
  }
  next();
};
module.exports = { checkPostId };
