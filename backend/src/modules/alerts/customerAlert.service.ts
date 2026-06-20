import { prisma } from "../../config/db.js";

export const getCustomerAlerts = async (user: any) => {
  const orgId = user.organizationId;

  //  Top Customers (by invoice total)
  const topCustomers = await prisma.customer.findMany({
    where: { organizationId: orgId },
    include: {
      invoices: true,
    },
  });

  const top = topCustomers
    .map((c) => {
      const totalSpent = c.invoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      );

      return {
        customerId: c.id,
        name: c.name,
        totalSpent,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  //  Inactive Customers (no invoices in last 30 days)
  const inactiveCustomers = topCustomers
    .map((c) => {
      const lastInvoice = c.invoices
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )[0];

      const daysInactive = lastInvoice
        ? Math.floor(
            (Date.now() - new Date(lastInvoice.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      return {
        customerId: c.id,
        name: c.name,
        daysInactive,
      };
    })
    .filter((c) => c.daysInactive >= 30)
    .slice(0, 5);

  //  Build alerts array
  const alerts: any[] = [];

  // Top Customers Alert
  top.forEach((c) => {
    alerts.push({
      type: "TOP_CUSTOMER",
      severity: "info",
      customerId: c.customerId,
      customerName: c.name,
      totalSpent: c.totalSpent,
      message: `${c.name} is a top customer (${c.totalSpent.toFixed(
        2
      )})`,
    });
  });

  // Inactive Customers Alert
  inactiveCustomers.forEach((c) => {
    alerts.push({
      type: "INACTIVE_CUSTOMER",
      severity: "warning",
      customerId: c.customerId,
      customerName: c.name,
      daysInactive: c.daysInactive,
      message: `${c.name} inactive for ${c.daysInactive} days`,
    });
  });

  return {
    success: true,
    count: alerts.length,
    alerts,
  };
};