const express = require("express");
const router = express.Router();
const {
  sanitizePostContent,
} = require("../middlewares/sanitizationMiddleware");
const {
  getAccessToRoute,
  isAuthorOrAdmin,
  isOwnerOrAdmin,
} = require("../middlewares/authMiddleware");
const {
  newPost,
  getAllPosts,
  incPostView,
  updatePost,
  deletePost,
  postById,
  incPostLike,
  decPostLike,
  searchPosts,
} = require("../controllers/postController");

const { checkPostId } = require("../middlewares/databaseMiddleware");

// Tüm postları getir - herkes erişebilir
router.get("/", getAllPosts);

// Post arama - herkes erişebilir
router.get("/search", searchPosts);

// Tek bir post getir - herkes erişebilir
router.get("/one-post/:id", checkPostId, postById);

// Post görüntüleme sayısını artır - herkes erişebilir
router.put("/:id/view", checkPostId, incPostView);

// Post beğeni işlemleri - giriş yapmış herkes erişebilir
router.put("/:id/upvote", getAccessToRoute, checkPostId, incPostLike);
router.put("/:id/downvote", getAccessToRoute, checkPostId, decPostLike);

// Post paylaşma - yazarlar ve adminler yapabilir
router.post(
  "/",
  getAccessToRoute,
  isAuthorOrAdmin,
  sanitizePostContent,
  newPost
);

// Post güncelleme ve silme - sadece içerik sahibi veya admin yapabilir
router
  .route("/:id")
  .put(
    getAccessToRoute,
    checkPostId,
    isOwnerOrAdmin,
    sanitizePostContent,
    updatePost
  )
  .delete(getAccessToRoute, checkPostId, isOwnerOrAdmin, deletePost);

module.exports = router;
