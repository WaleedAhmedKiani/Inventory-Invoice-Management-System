import { Redis } from "ioredis";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

if (!process.env.REDIS_URL) {
    logger.error("REDIS_URL is not defined in .env! ");
    throw new Error("REDIS_URL is not defined in .env");
}

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
});

// !SUCCESS LOG
redis.on("connect", () => {
    logger.info(" Upstash Redis Connected via TCP!");
});



// !ERROR LOG
redis.on("error", (err) => {
    logger.error({ err }, "Redis Connection Error ");
});


export default redis;