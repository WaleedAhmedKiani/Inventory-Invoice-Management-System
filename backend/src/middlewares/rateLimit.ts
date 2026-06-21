import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { Request } from "express";
import redis from "../config/redis.js";

// Helper to extract the actual client IP
const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    // IP in the comma-separated list (the actual client)
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || "global-fallback";
};

// Helper to create the Redis store 
const createStore = (prefix: string) => new RedisStore({
  // @ts-expect-error - ioredis type mismatch
  sendCommand: (...args: string[]) => redis.call(...args),
  prefix: prefix,
});

// GLOBAL LIMITER: 1000 req / 1 min 
export const globalLimiter = rateLimit({
  store: createStore("rl-global:"),
  windowMs: 60 * 1000,
  limit: 1000, // Generous limit for high-performing APIs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: getClientIp, // Crucial: Tracks actual client IP, not Render's proxy
  message: { status: 429, message: "Too many requests. Please try again in a minute." },
});

// LOGIN LIMITER: 100 attempts / 1 min 
export const loginLimiter = rateLimit({
  store: createStore("rl-login:"),
  windowMs: 60 * 1000, // Reduced from 15 minutes to 1 minute 
  limit: 100,         // Increased to 100 attempts 
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: getClientIp, // Crucial: Prevents locking out other users
  message: {
    status: 429,
    message: "Too many login attempts. Please wait 60 seconds and try again."
  },
});