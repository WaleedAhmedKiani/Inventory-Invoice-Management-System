import { prisma } from "../../config/db.js";

export const getInventoryAlerts = async (user: any) => {
  const products = await prisma.product.findMany({
    where: {
      organizationId: user.organizationId,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      stock: true,
    },
  });

  const alerts: any[] = [];

  for (const product of products) {
    // Out of Stock
    if (product.stock === 0) {
      alerts.push({
        type: "OUT_OF_STOCK",
        severity: "critical",
        productId: product.id,
        productName: product.name,
        stock: product.stock,
        message: `${product.name} is out of stock`,
      });
    }

    // Low Stock
    else if (product.stock <= 5) {
      alerts.push({
        type: "LOW_STOCK",
        severity: "warning",
        productId: product.id,
        productName: product.name,
        stock: product.stock,
        message: `${product.name} is running low (${product.stock} left)`,
      });
    }
  }

  alerts.sort((a, b) => {
    if (a.severity === "critical" && b.severity !== "critical") {
      return -1;
    }

    if (a.severity !== "critical" && b.severity === "critical") {
      return 1;
    }

    return 0;
  });

  return alerts;
};