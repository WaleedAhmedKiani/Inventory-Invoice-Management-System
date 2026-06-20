import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import   redis  from "../config/redis.js";

// Helper to create the store 
const createStore = (prefix: string) => new RedisStore({
  // @ts-expect-error - ioredis type mismatch
  sendCommand: (...args: string[]) => redis.call(...args),
  prefix: prefix,
});

// GLOBAL LIMITER: 100 req / 1 min
export const globalLimiter = rateLimit({
  store: createStore("rl-global:"),
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { status: 429, message: "Too many requests." },
});

// LOGIN LIMITER: 5 attempts / 15 mins
export const loginLimiter = rateLimit({
  store: createStore("rl-login:"),
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, 
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { 
    status: 429, 
    message: "Too many login attempts. Please try again in 15 minutes." 
  },
});