import pino from "pino";
import { pinoHttp } from "pino-http";

//  ^The Base Logger (For manual logs in services/config)
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

//  ^The HTTP Middleware (For app.ts)
export const httpLogger = pinoHttp({
  logger,
  // Custom success message (optional)
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed with status ${res.statusCode}`;
  },
  // &Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },
});