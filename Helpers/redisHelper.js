const { createClient } = require("redis");

const RETRY_DELAY = 5000; // 5 seconds
const DEFAULT_CACHE_DURATION = 300; // 5 minutes
const MAX_RETRY_ATTEMPTS = 5;

let retryCount = 0;
let redisClient;

const createRedisClient = () => {
  return createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    retry_strategy: function (options) {
      if (options.error && options.error.code === "ECONNREFUSED") {
        // Sunucuya erişilemiyorsa
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // 1 saatten fazla yeniden deneme yapıldıysa
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        // 10'dan fazla deneme yapıldıysa
        return undefined;
      }
      // Üstel geri çekilme ile yeniden deneme
      return Math.min(options.attempt * 100, 3000);
    },
  });
};

// Connect to Redis with retry mechanism
const connectRedis = async () => {
  try {
    if (!redisClient) {
      redisClient = createRedisClient();

      redisClient.on("error", async (err) => {
        console.error("Redis Client Error:", err);
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          retryCount++;
          console.log(
            `Attempting to reconnect... (${retryCount}/${MAX_RETRY_ATTEMPTS})`
          );
          await connectRedis();
        }
      });

      redisClient.on("connect", () => {
        console.log("Redis Client Connected");
        retryCount = 0;
      });
    }

    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      retryCount++;
      console.log(
        `Retrying connection in ${
          RETRY_DELAY / 1000
        } seconds... (${retryCount}/${MAX_RETRY_ATTEMPTS})`
      );
      setTimeout(connectRedis, RETRY_DELAY);
    }
  }
};

// Cache middleware for posts with dynamic expiration
const cachePost = async (
  key,
  data,
  expirationInSeconds = DEFAULT_CACHE_DURATION
) => {
  try {
    if (!redisClient?.isOpen) {
      await connectRedis();
    }
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};

// Get cached post
const getCachedPost = async (key) => {
  try {
    if (!redisClient?.isOpen) {
      await connectRedis();
    }
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Redis get cache error:", error);
    return null;
  }
};

// Delete cache for a specific key
const deleteCacheKey = async (key) => {
  try {
    if (!redisClient?.isOpen) {
      await connectRedis();
    }
    await redisClient.del(key);
  } catch (error) {
    console.error("Redis delete cache error:", error);
  }
};

// Delete specific pattern of cache keys
const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient?.isOpen) {
      await connectRedis();
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `Cleared ${keys.length} cache entries matching pattern: ${pattern}`
      );
    }
  } catch (error) {
    console.error(`Redis delete pattern cache error for ${pattern}:`, error);
  }
};

// Delete all post-related caches
const deleteAllPostCaches = async () => {
  try {
    await deleteCachePattern("posts:*");
    await deleteCachePattern("post:*");
  } catch (error) {
    console.error("Redis delete all caches error:", error);
  }
};

module.exports = {
  connectRedis,
  cachePost,
  getCachedPost,
  deleteCacheKey,
  deleteCachePattern,
  deleteAllPostCaches,
};
