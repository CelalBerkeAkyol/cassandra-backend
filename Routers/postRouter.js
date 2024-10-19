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
} = require("../controllers/postController");
const { getAllCategory, gettAllStatus } = require("../Helpers/postHelpers");
const { checkPostId } = require("../middlewares/databaseMidleware");
//Tüm postları getir
router.get("/", getAllPosts);
// id si verilen bir post varsa getirilir
// kategoriye göre post getirir

router.get("/:id", checkPostId, getOnePost);
// post paylaşma
router.post("/", getAccessToRoute, isAdmin, sanitizePostContent, newPost);
router
  .route("/:id")
  .put(getAccessToRoute, isAdmin, checkPostId, sanitizePostContent, updatePost)
  .delete(getAccessToRoute, isAdmin, checkPostId, detelePost);
// postların kategorilerini
router.get("/post-categories", getAllCategory);
// postların durumlarını
router.get("/post-status", gettAllStatus);
module.exports = router;
