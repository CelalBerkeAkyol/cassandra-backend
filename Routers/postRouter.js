const express = require("express");
const router = express.Router();
const { sanitizePostContent } = require("../middlewares/sanitizionMiddleware");
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");
const {
  newPost,
  getAllPosts,
  incPostView,
  updatePost,
  deletePost,
  postById,
  incPostLike,
  decPostLike,
} = require("../controllers/postController");

const { checkPostId } = require("../middlewares/databaseMidleware");

//Tüm postları getir
router.get("/", getAllPosts);
// id si verilen bir post varsa getirilir
// kategoriye göre post getirir

// post paylaşma
router.post("/", getAccessToRoute, isAdmin, sanitizePostContent, newPost);
router
  .route("/:id")
  .put(getAccessToRoute, isAdmin, checkPostId, sanitizePostContent, updatePost)
  .delete(getAccessToRoute, isAdmin, checkPostId, deletePost);
router.get("/one-post/:id", checkPostId, postById);
router.put("/:id/view", checkPostId, incPostView);
router.put("/:id/upvote", getAccessToRoute, checkPostId, incPostLike);
router.put("/:id/downvote", getAccessToRoute, checkPostId, decPostLike);
module.exports = router;
