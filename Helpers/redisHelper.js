const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};

// Cache middleware for posts
const cachePost = async (key, data, expirationInSeconds = 3600) => {
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};

// Get cached post
const getCachedPost = async (key) => {
  try {
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
    await redisClient.del(key);
  } catch (error) {
    console.error("Redis delete cache error:", error);
  }
};

module.exports = {
  connectRedis,
  cachePost,
  getCachedPost,
  deleteCacheKey,
};
