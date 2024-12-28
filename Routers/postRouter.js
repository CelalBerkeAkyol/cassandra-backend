const express = require("express");
const router = express.Router();
const { sanitizePostContent } = require("../middlewares/sanitizionMiddleware");
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");
const {
  newPost,
  getAllPosts,
  getOnePost,
  updatePost,
  detelePost,
  postById,
} = require("../controllers/postController");

const { checkPostId } = require("../middlewares/databaseMidleware");

//Tüm postları getir
router.get("/", getAllPosts);
// id si verilen bir post varsa getirilir
// kategoriye göre post getirir

router.get("/:slug", getOnePost);
// post paylaşma
router.post("/", getAccessToRoute, isAdmin, sanitizePostContent, newPost);
router
  .route("/:id")

  .put(getAccessToRoute, isAdmin, checkPostId, sanitizePostContent, updatePost)
  .delete(getAccessToRoute, isAdmin, checkPostId, detelePost);
router.get("/one-post/:id", postById);
module.exports = router;
