import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => {
  console.log("Redis bağlantısı başarılı");
});

redisClient.on("error", (err) => {
  console.error("Redis bağlantı hatası:", err);
});

export default redisClient;
