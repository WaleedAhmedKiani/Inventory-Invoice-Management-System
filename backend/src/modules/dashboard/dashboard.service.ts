import { prisma } from "../../config/db.js";
import dayjs from "dayjs";

// *Dashboard Analytics
export const getDashboardStats = async (user: any, query: any) => {
    const organizationId = user.organizationId;
    const { range = "30d" } = query || {};

    // IMPROVED DATE LOGIC: Ensure ranges are precise
    const now = new Date();
    let startDate = new Date();

    const daysToSubtract = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    startDate.setDate(now.getDate() - daysToSubtract);

    // Previous start date is shifted back by the same amount of days again
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - daysToSubtract);

    const [
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        cancelledInvoices,
        totalRevenue,
        pendingRevenue,
        recentInvoices,
    ] = await Promise.all([
        prisma.invoice.count({
            where: { organizationId, createdAt: { gte: startDate } },
        }),
        prisma.invoice.count({
            where: { organizationId, status: "PAID", createdAt: { gte: startDate } },
        }),
        prisma.invoice.count({
            where: { organizationId, status: "PENDING", createdAt: { gte: startDate } },
        }),
        prisma.invoice.count({
            where: { organizationId, status: "CANCELLED", createdAt: { gte: startDate } },
        }),
        prisma.invoice.aggregate({
            where: { organizationId, status: "PAID", createdAt: { gte: startDate } },
            _sum: { total: true },
        }),
        prisma.invoice.aggregate({
            where: { organizationId, status: "PENDING", createdAt: { gte: startDate } },
            _sum: { total: true },
        }),
        prisma.invoice.findMany({
            where: { organizationId, createdAt: { gte: startDate } },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { customer: { select: { name: true } } },
        }),
    ]);

    // PREVIOUS PERIOD DATA (For Growth Comparison)
    const [
        prevRevenue,
        prevInvoicesCount,
        prevPaidCount, // Added this for Paid Invoices growth
    ] = await Promise.all([
        prisma.invoice.aggregate({
            where: {
                organizationId,
                status: "PAID",
                createdAt: { gte: prevStartDate, lt: startDate }
            },
            _sum: { total: true }
        }),
        prisma.invoice.count({
            where: {
                organizationId,
                createdAt: { gte: prevStartDate, lt: startDate }
            }
        }),
        prisma.invoice.count({
            where: {
                organizationId,
                status: "PAID",
                createdAt: { gte: prevStartDate, lt: startDate }
            }
        })
    ]);

    const calcGrowth = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? null : 0;
        }
        return ((current - previous) / previous) * 100;
    };

    //  CALCULATE ALL GROWTH TRENDS
    const revenueGrowth = calcGrowth(
        totalRevenue._sum.total || 0,
        prevRevenue._sum.total || 0
    );

    const invoiceGrowth = calcGrowth(
        totalInvoices,
        prevInvoicesCount
    );

    const paidInvoiceGrowth = calcGrowth(
        paidInvoices,
        prevPaidCount
    );

    // --- REMAINDER OF LOGIC (Charts & Grouping) ---
    const invoices = await prisma.invoice.findMany({
        where: {
            organizationId: user.organizationId,
            status: "PAID",
            createdAt: { gte: startDate }
        },
        select: { total: true, createdAt: true },
    });

    const monthlyMap: any = {};
    invoices.forEach((inv) => {
        const month = dayjs(inv.createdAt).format("MMM");
        if (!monthlyMap[month]) monthlyMap[month] = 0;
        monthlyMap[month] += inv.total;
    });

    const monthlyRevenue = Object.keys(monthlyMap).map((month) => ({
        month,
        revenue: monthlyMap[month],
    }));

    const topCustomers = await prisma.invoice.groupBy({
        by: ["customerId"],
        where: {
            organizationId: user.organizationId,
            status: "PAID",
            createdAt: { gte: startDate }
        },
        _sum: { total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: 5,
    });

    const customers = await prisma.customer.findMany({
        where: { id: { in: topCustomers.map(c => c.customerId) } },
        select: { id: true, name: true },
    });

    const topCustomersWithNames = topCustomers.map(c => ({
        name: customers.find(cu => cu.id === c.customerId)?.name,
        total: c._sum.total,
        invoices: c._count,
    }));

    const topProducts = await prisma.invoiceItem.groupBy({
        by: ["productId"],
        where: {
            invoice: {
                organizationId: user.organizationId,
                status: "PAID",
                createdAt: { gte: startDate }
            }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });

    const products = await prisma.product.findMany({
        where: { id: { in: topProducts.map(p => p.productId) } },
        select: { id: true, name: true },
    });

    const topProductsWithNames = topProducts.map(p => ({
        name: products.find(pr => pr.id === p.productId)?.name,
        quantity: p._sum.quantity,
    }));

    // mini chart
    // Helper to generate 7 days of trend data
    const getTrendData = (invoices: any[], days: number, statusFilter?: string) => {
        const points = [];
        for (let i = days; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');

            // Filter invoices for this specific day
            const dayTotal = invoices
                .filter(inv => {
                    const isSameDay = dayjs(inv.createdAt).format('YYYY-MM-DD') === date;
                    return statusFilter ? (isSameDay && inv.status === statusFilter) : isSameDay;
                })
                .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

            points.push({ value: dayTotal });
        }
        return points;
    };

    // Fetch all invoices from the last 7 days to process for sparklines
    const sparklineInvoices = await prisma.invoice.findMany({
        where: {
            organizationId,
            createdAt: { gte: dayjs().subtract(7, 'day').toDate() }
        },
        select: { total: true, createdAt: true, status: true }
    });

    const revenueSparkline = getTrendData(sparklineInvoices, 7, "PAID");
    const invoiceSparkline = getTrendData(sparklineInvoices, 7); // Total count trend

    return {
        stats: {
            totalInvoices,
            paidInvoices,
            pendingInvoices,
            monthlyRevenue,
            cancelledInvoices,
            totalRevenue: totalRevenue._sum.total || 0,
            pendingRevenue: pendingRevenue._sum.total || 0,
            revenueGrowth,
            invoiceGrowth,
            paidInvoiceGrowth,
            revenueSparkline,
            invoiceSparkline,
        },
        recentInvoices: recentInvoices.map((inv) => ({
            id: inv.id,
            customerName: inv.customer.name,
            total: inv.total,
            status: inv.status,
            createdAt: inv.createdAt,
        })),
        topCustomers: topCustomersWithNames,
        topProducts: topProductsWithNames,
    };
};