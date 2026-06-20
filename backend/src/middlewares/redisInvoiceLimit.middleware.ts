import { NextFunction } from "express";
import redis from "../config/redis.js";
import { prisma } from "../config/db.js"; 
import {logger } from "../utils/logger.js";

export const checkInvoiceLimit = async (req: any, res: any, next: NextFunction) => {

  const { organizationId: orgId, plan: userPlan } = req.user;
  const key = `invoice_count:${orgId}`;

  // ^Always allow PRO users
  if (userPlan === "PRO") return next();

  try {
    // ^Check Redis
    let count = await redis.get(key);

    
    // &If count is null, we MUST check Postgres once to stay accurate
    if (count === null) {
      const dbCount = await prisma.invoice.count({
        where: { organizationId: orgId },
        
      });
      await redis.set(key, dbCount, "EX", 86400);
      count = dbCount.toString();
      logger.debug({ orgId }, "Invoice count synced from DB to Redis");

      // ^Sync Redis for 24 hours so we don't hit the DB again
      await redis.set(key, dbCount, "EX", 86400);
      count = dbCount.toString();
    }

    // *Enforce the Limit
    if (Number(count) >= 30) {
      logger.warn({ orgId }, "Invoice limit blocked (Free Plan)");
      return res.status(403).json({
        success: false,
        message: "Free plan limit reached (30/30). Upgrade to PRO for unlimited invoices.",
      });
    }

    next();
  } catch (error) {
    logger.error({ error, orgId }, "Redis Limit Check Failed");
    next();
  }
};