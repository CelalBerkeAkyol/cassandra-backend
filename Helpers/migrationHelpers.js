const Post = require("../Models/PostSchema");
const { processPostImages } = require("./imageProcessingHelpers");

/**
 * Tüm post'lardaki external image'ları bulur ve migrate eder
 * @param {object} options - Migration ayarları
 * @returns {Promise<object>} Migration sonuçları
 */
const migrateAllPostImages = async (options = {}) => {
  const {
    dryRun = false, // Sadece analiz yapar, değişiklik yapmaz
    batchSize = 10, // Aynı anda işlenecek post sayısı
    skipProcessed = true, // Daha önce işlenmiş postları atla
  } = options;

  console.log("Starting post image migration...");
  console.log(
    `Options: dryRun=${dryRun}, batchSize=${batchSize}, skipProcessed=${skipProcessed}`
  );

  try {
    // Tüm postları getir
    const posts = await Post.find({}).populate("author", "id userName");
    console.log(`Found ${posts.length} posts to analyze`);

    const migrationResults = {
      totalPosts: posts.length,
      postsWithExternalImages: 0,
      totalExternalImages: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      errors: [],
      processedPosts: [],
    };

    // Postları batch'ler halinde işle
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          posts.length / batchSize
        )}`
      );

      for (const post of batch) {
        try {
          // External image'ları kontrol et
          const externalImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
          const externalImages = [];
          let match;

          while ((match = externalImageRegex.exec(post.content)) !== null) {
            externalImages.push({
              altText: match[1],
              url: match[2],
              originalMatch: match[0],
            });
          }

          if (externalImages.length === 0) {
            continue; // Bu post'ta external image yok
          }

          migrationResults.postsWithExternalImages++;
          migrationResults.totalExternalImages += externalImages.length;

          console.log(
            `Post ${post._id}: Found ${externalImages.length} external images`
          );

          if (dryRun) {
            // Sadece analiz modu
            migrationResults.processedPosts.push({
              postId: post._id,
              title: post.title,
              externalImageCount: externalImages.length,
              images: externalImages.map((img) => img.url),
            });
            continue;
          }

          // Gerçek migration
          const mockReq = {
            protocol: "https",
            get: () => "localhost:5000", // Bu değeri gerçek domain ile değiştirin
            user: { id: post.author._id || post.author },
          };

          const imageResult = await processPostImages(
            post.content,
            post.author._id || post.author,
            mockReq
          );

          if (imageResult.processedImages.length > 0) {
            // Post'u güncelle
            post.content = imageResult.updatedContent;
            await post.save();

            migrationResults.successfulMigrations +=
              imageResult.processedImages.length;
            console.log(
              `Post ${post._id}: Successfully migrated ${imageResult.processedImages.length} images`
            );
          }

          if (imageResult.errors.length > 0) {
            migrationResults.failedMigrations += imageResult.errors.length;
            migrationResults.errors.push({
              postId: post._id,
              errors: imageResult.errors,
            });
            console.warn(
              `Post ${post._id}: ${imageResult.errors.length} images failed to migrate`
            );
          }

          migrationResults.processedPosts.push({
            postId: post._id,
            title: post.title,
            successfulMigrations: imageResult.processedImages.length,
            failedMigrations: imageResult.errors.length,
            processedImages: imageResult.processedImages.map((img) => ({
              originalUrl: img.originalUrl,
              newUrl: img.url,
            })),
          });
        } catch (error) {
          console.error(`Error processing post ${post._id}:`, error);
          migrationResults.errors.push({
            postId: post._id,
            error: error.message,
          });
        }
      }

      // Batch'ler arası kısa bekleme
      if (i + batchSize < posts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Migration completed!");
    console.log(
      `Results: ${migrationResults.successfulMigrations} successful, ${migrationResults.failedMigrations} failed`
    );

    return migrationResults;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

/**
 * Belirli bir post'un image'ları migrate eder
 * @param {string} postId - Post ID'si
 * @param {object} req - Request objesi
 * @returns {Promise<object>} Migration sonucu
 */
const migratePostImages = async (postId, req) => {
  try {
    const post = await Post.findById(postId).populate("author", "id");

    if (!post) {
      throw new Error("Post not found");
    }

    console.log(`Migrating images for post: ${post.title}`);

    const imageResult = await processPostImages(
      post.content,
      post.author._id,
      req
    );

    if (imageResult.processedImages.length > 0) {
      post.content = imageResult.updatedContent;
      await post.save();
    }

    return {
      postId: post._id,
      title: post.title,
      processedImages: imageResult.processedImages,
      errors: imageResult.errors,
      updatedContent: imageResult.updatedContent,
    };
  } catch (error) {
    console.error(`Error migrating post ${postId}:`, error);
    throw error;
  }
};

/**
 * Migration istatistiklerini gösterir
 * @returns {Promise<object>} İstatistikler
 */
const getMigrationStats = async () => {
  try {
    const totalPosts = await Post.countDocuments();

    // External image içeren postları bul
    const postsWithExternalImages = await Post.find(
      {
        content: { $regex: /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g },
      },
      "_id title content"
    );

    let totalExternalImages = 0;
    const postStats = postsWithExternalImages.map((post) => {
      const externalImageMatches =
        post.content.match(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g) || [];
      totalExternalImages += externalImageMatches.length;

      return {
        postId: post._id,
        title: post.title,
        externalImageCount: externalImageMatches.length,
      };
    });

    return {
      totalPosts,
      postsWithExternalImages: postsWithExternalImages.length,
      totalExternalImages,
      postStats,
    };
  } catch (error) {
    console.error("Error getting migration stats:", error);
    throw error;
  }
};

module.exports = {
  migrateAllPostImages,
  migratePostImages,
  getMigrationStats,
};
