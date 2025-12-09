import { Queue } from "bullmq";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

export const productImportQueue = new Queue("product-import-queue", {
  connection: redisConnection,
});
