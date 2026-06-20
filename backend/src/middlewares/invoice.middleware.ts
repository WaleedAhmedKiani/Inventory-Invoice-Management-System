import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";



//   &Middleware to enforce plan-based limits.
//  ^Prevents Free users from creating more than 10 invoices.
 
export const checkInvoiceLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ message: "Unauthorized: No organization linked to user." });
    }

    //  ^PERFORMANCE: Only select 'plan' to avoid fetching unnecessary data
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org) {
      return res.status(404).json({ message: "Organization not found." });
    }

    // ^EARLY RETURN: Pro users skip the expensive count query
    if (org.plan === "PRO") {
      return next();
    }

    // ^COUNT CHECK: Only runs for Free users
    const invoiceCount = await prisma.invoice.count({
      where: { organizationId },
    });

    const LIMIT = 10;

    if (invoiceCount >= LIMIT) {
      return res.status(403).json({
        message: `Limit reached. Free plans are limited to ${LIMIT} invoices. Please upgrade to PRO for unlimited access.`,
        code: "LIMIT_REACHED"
      });
    }

    
    next();
  } catch (error) {
    console.error("Error in checkInvoiceLimit middleware:", error);
    res.status(500).json({ message: "Internal server error while checking limits." });
  }
};