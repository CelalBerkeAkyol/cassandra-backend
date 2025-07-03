const { Kafka } = require("kafkajs");

let producer;

/**
 * Establishes a connection to the Kafka cluster using the broker list
 * provided in the KAFKA_BROKERS environment variable (comma-separated).
 * Defaults to ["kafka:9092"] when the variable is absent.
 */
async function connectKafka() {
  const brokers = process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["kafka:9092"];

  const kafka = new Kafka({
    clientId: "finance-blog-backend",
    brokers,
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka producer connected to", brokers.join(", "));
}

/**
 * Publishes one or more messages to the specified topic.
 * Automatically (lazily) connects the producer if it has not been
 * initialised yet.
 *
 * @param {string} topic  Kafka topic name
 * @param {object|object[]} payload  A single message object/string or an array
 */
async function publishMessage(topic, payload) {
  if (!producer) {
    await connectKafka();
  }

  const messages = Array.isArray(payload) ? payload : [payload];

  await producer.send({
    topic,
    messages: messages.map((m) => ({
      value: typeof m === "string" ? m : JSON.stringify(m),
    })),
  });

  console.log(`Published ${messages.length} message(s) to topic ${topic}`);
}

module.exports = { connectKafka, publishMessage };
