import { prisma } from "../config/db.js";
import { PLAN_LIMITS } from "../utils/billing.js";

export const checkProductLimit = async (
    req: any,
    res: any,
    next: any
) => {
    const organizationId = req.user.organizationId;

    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
    });

    if (!org) {
        return res.status(404).json({
            message: "Organization not found",
        });
    }

    // PRO users bypass limits
    if (org.plan === "PRO") {
        return next();
    }

    // Count products
    const productCount = await prisma.product.count({
        where: { organizationId },
    });

    const limit = PLAN_LIMITS.FREE.products;

    const isLimitReached =
        limit !== null && productCount >= limit;

    if (isLimitReached) {
        return res.status(403).json({
            message: `FREE plan limited to ${limit} products. Upgrade to PRO.`,
        });
    }

    next();
};