// kafkaConsumer.js
const { Kafka } = require("kafkajs");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");

class KafkaConsumer {
  constructor() {
    this.consumer = null;
    this.brokers = process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",")
      : ["kafka:29092"];
    this.RETRY_DELAY = 5000;
    this.logDir = path.join(__dirname, "../..", "logs");
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error("Error creating log directory:", error);
    }
  }

  async logToFile(topic, message) {
    await this.ensureLogDirectory();
    const now = new Date();
    const logFileName = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.log`;
    const logPath = path.join(this.logDir, logFileName);

    const logEntry = {
      timestamp: now.toISOString(),
      topic,
      message,
    };

    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + "\n", "utf8");
    } catch (error) {
      console.error("Error writing to log file:", error);
    }
  }

  async handleMessage(message) {
    try {
      const data = JSON.parse(message.value.toString());
      const topic = message.topic;

      // Log the message to file
      await this.logToFile(topic, data);

      switch (topic) {
        case "post-created":
          console.log(
            `[${new Date().toISOString()}] Yeni blog yazısı eklendi:`,
            {
              title: data.title,
              author: data.author,
              createdAt: data.createdAt,
            }
          );
          break;

        case "post-updated":
          console.log(
            `[${new Date().toISOString()}] Blog yazısı güncellendi:`,
            {
              title: data.title,
              author: data.author,
              updatedAt: data.updatedAt,
            }
          );
          break;

        case "post-deleted":
          console.log(`[${new Date().toISOString()}] Blog yazısı silindi:`, {
            title: data.title,
            deletedAt: new Date().toISOString(),
          });
          break;

        default:
          console.log(`[${new Date().toISOString()}] Unknown topic:`, topic);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  async connect() {
    try {
      const kafka = new Kafka({
        clientId: "blog-consumer",
        brokers: this.brokers,
        retry: {
          initialRetryTime: 100,
          retries: 15,
        },
      });

      this.consumer = kafka.consumer({ groupId: "blog-post-group" });
      await this.consumer.connect();
      console.log("Kafka consumer connected successfully");

      // Subscribe to topics
      await this.consumer.subscribe({
        topic: "post-created",
        fromBeginning: true,
      });
      await this.consumer.subscribe({
        topic: "post-updated",
        fromBeginning: true,
      });
      await this.consumer.subscribe({
        topic: "post-deleted",
        fromBeginning: true,
      });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log("\n--- New Message Received ---");
          console.log(`Topic: ${topic}, Partition: ${partition}`);
          await this.handleMessage(message);
          console.log("--------------------------\n");
        },
      });
    } catch (error) {
      console.error("Failed to connect to Kafka:", error);
      console.log(`Retrying in ${this.RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => this.connect(), this.RETRY_DELAY);
    }
  }

  async disconnect() {
    if (this.consumer) {
      await this.consumer.disconnect();
      console.log("Kafka consumer disconnected");
    }
  }
}

// Create and start consumer
const kafkaConsumer = new KafkaConsumer();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await kafkaConsumer.disconnect();
  } finally {
    process.exit(0);
  }
});

// Start the consumer
console.log("Starting Kafka consumer...");
kafkaConsumer.connect();

module.exports = kafkaConsumer;
