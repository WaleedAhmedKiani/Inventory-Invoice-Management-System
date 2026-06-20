import { prisma } from "../../config/db.js";
import { PLAN_LIMITS } from "../../utils/billing.js";

export const getUsage = async (req: any, res: any) => {
  const organizationId = req.user.organizationId;

  // Get organization with plan
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      plan: true,
    },
  });

  if (!organization) {
    return res.status(404).json({
      message: "Organization not found",
    });
  }

  const plan = organization.plan;

  // Count usage
  const [products, customers, invoices] = await Promise.all([
    prisma.product.count({
      where: { organizationId },
    }),

    prisma.customer.count({
      where: { organizationId },
    }),

    prisma.invoice.count({
      where: { organizationId },
    }),
  ]);

  return res.json({
    plan,

    limits: PLAN_LIMITS[plan],

    usage: {
      products,
      customers,
      invoices,
    },
  });
};