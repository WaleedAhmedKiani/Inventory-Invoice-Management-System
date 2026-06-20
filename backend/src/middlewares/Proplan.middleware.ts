import { prisma } from "../config/db.js";
import { Request, Response, NextFunction } from "express";

export const requireProPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org || org.plan !== "PRO") {
      return res.status(403).json({
        message: "PRO plan required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Plan verification failed",
    });
  }
};