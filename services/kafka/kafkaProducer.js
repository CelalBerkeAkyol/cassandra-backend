const { Kafka } = require("kafkajs");
require("dotenv").config();

class KafkaProducer {
  constructor() {
    this.producer = null;
    this.brokers = process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",")
      : ["kafka:29092"];
  }

  async connect() {
    try {
      const kafka = new Kafka({
        clientId: "blog-producer",
        brokers: this.brokers,
        retry: {
          initialRetryTime: 100,
          retries: 15,
        },
      });

      this.producer = kafka.producer();
      await this.producer.connect();
      console.log("Kafka producer connected successfully");
    } catch (error) {
      console.error("Failed to connect to Kafka:", error);
      throw error;
    }
  }

  async sendMessage(topic, message) {
    try {
      if (!this.producer) {
        await this.connect();
      }

      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });

      console.log(`Message sent to topic ${topic}:`, message);
    } catch (error) {
      console.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
      console.log("Kafka producer disconnected");
    }
  }
}

// Singleton instance
const kafkaProducer = new KafkaProducer();

module.exports = kafkaProducer;
