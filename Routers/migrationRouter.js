const express = require("express");
const router = express.Router();
const {
  migrateAllPostImages,
  migratePostImages,
  getMigrationStats,
} = require("../Helpers/migrationHelpers");
const { getAccessToRoute, isAdmin } = require("../middlewares/authMiddleware");

// Migration istatistiklerini getir - sadece admin
router.get("/stats", getAccessToRoute, isAdmin, async (req, res) => {
  try {
    const stats = await getMigrationStats();
    res.status(200).json({
      success: true,
      message: "Migration istatistikleri getirildi",
      data: stats,
    });
  } catch (error) {
    console.error("Migration stats error:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler alınırken hata oluştu",
      error: error.message,
    });
  }
});

// Tüm postları migrate et - sadece admin
router.post("/migrate-all", getAccessToRoute, isAdmin, async (req, res) => {
  try {
    const { dryRun = false, batchSize = 10 } = req.body;

    const results = await migrateAllPostImages({
      dryRun,
      batchSize,
    });

    res.status(200).json({
      success: true,
      message: dryRun ? "Migration analizi tamamlandı" : "Migration tamamlandı",
      data: results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      success: false,
      message: "Migration sırasında hata oluştu",
      error: error.message,
    });
  }
});

// Belirli bir post'u migrate et - sadece admin
router.post(
  "/migrate-post/:postId",
  getAccessToRoute,
  isAdmin,
  async (req, res) => {
    try {
      const { postId } = req.params;

      const result = await migratePostImages(postId, req);

      res.status(200).json({
        success: true,
        message: "Post migration tamamlandı",
        data: result,
      });
    } catch (error) {
      console.error("Post migration error:", error);
      res.status(500).json({
        success: false,
        message: "Post migration sırasında hata oluştu",
        error: error.message,
      });
    }
  }
);

module.exports = router;
