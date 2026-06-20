import { prisma } from "../../config/db.js";

export const getInvoiceAlerts = async (user: any) => {
    const invoices = await prisma.invoice.findMany({
        where: {
            organizationId: user.organizationId,
            status: "PENDING",
        },
        include: {
            customer: {
                select: {
                    name: true,
                },
            },
        },
    });

    const alerts: any[] = [];

    const now = new Date();

    for (const invoice of invoices) {
        const ageInDays = Math.floor(
            (now.getTime() - invoice.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        //  Overdue Invoice (older than 7 days)
        if (ageInDays >= 7) {
            alerts.push({
                type: "OVERDUE_INVOICE",
                severity: "critical",
                invoiceId: invoice.id,
                customerName: invoice.customer.name,
                total: invoice.total,
                daysPending: ageInDays,
                message: `Invoice for ${invoice.customer.name} is overdue`,
            });

            continue;
        }

        //  Pending Invoice
        alerts.push({
            type: "PENDING_INVOICE",
            severity: "warning",
            invoiceId: invoice.id,
            customerName: invoice.customer.name,
            total: invoice.total,
            daysPending: ageInDays,
            message: `Invoice for ${invoice.customer.name} is pending`,
        });
    }

    return {
        success: true,
        count: alerts.length,
        alerts,
    };
};