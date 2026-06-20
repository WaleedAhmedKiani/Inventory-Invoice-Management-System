import { prisma } from "../../config/db.js";
import redis from "../../config/redis.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { sendEmail } from "../email/email.service.js";
import { invoiceEmailTemplate } from "../../utils/templates/invoiceEmail.template.js";
import { generateInvoicePdf } from "../../utils/pdf/invoicePdf.js";


// ^Create an invoice for a customer with multiple items
export const createInvoice = async (data: any, user: any) => {
    const { organizationId: orgId } = user;
    const { customerId, items, tax = 0, discount = 0 } = data;

    const result = await prisma.$transaction(async (tx) => {

        
        // Validate customer
        
        const customer = await tx.customer.findFirst({
            where: {
                id: customerId,
                organizationId: user.organizationId,
            },
            select: {
                name: true,
                email: true,
            }
        });

        if (!customer) throw new Error("Customer not found");

        const invoiceItems: any[] = [];
        let calculatedSubtotal = 0;

        
        // Process items
        
        for (const item of items) {
            const product = await tx.product.findFirst({
                where: {
                    id: item.productId,
                    organizationId: user.organizationId,
                },
            });

            if (!product) throw new Error("Product not found");

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            const itemTotal = product.price * item.quantity;
            calculatedSubtotal += itemTotal;

            invoiceItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });

            // reduce stock
            await tx.product.update({
                where: { id: product.id },
                data: {
                    stock: product.stock - item.quantity,
                },
            });
        }

        const finalTotal = Number(((calculatedSubtotal + tax) - discount).toFixed(2));

        
        // Create invoice
    
        const invoice = await tx.invoice.create({
            data: {
                customerId,
                organizationId: user.organizationId,
                subtotal: calculatedSubtotal,
                tax,
                discount,
                total: finalTotal,
                items: {
                    create: invoiceItems,
                },
            },
            include: {
                customer: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        
        // Audit Log
        
        await createAuditLog({
            action: "CREATE",
            entity: "INVOICE",
            entityId: invoice.id,
            userId: user.id,
            organizationId: user.organizationId,
        });

        return {
            invoice,
            customerEmail: customer.email || "",
            customerName: customer.name,
        };
    });

    const { invoice, customerEmail } = result;

    
    // Redis (non-blocking)
    
    try {
        const redisKey = `invoice_count:${orgId}`;
        await redis.incr(redisKey);
        await redis.expire(redisKey, 2592000);
    } catch (err) {
        console.error("Redis error:", err);
    }

    
    // INVOICE EMAIL ONLY
    
    try {
        if (customerEmail) {
            const html = invoiceEmailTemplate({
                ...invoice,
                customerName: invoice.customer.name,
            });

            await sendEmail(
                customerEmail,
                `Invoice #${invoice.id} Created`,
                html
            );

            console.log("Invoice email sent");
        }
    } catch (emailError) {
        console.error("Invoice email failed", emailError);
    }

    return invoice;
};

// ^Get invoice details 
export const getInvoices = async (user: any, query: any) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(Number(query.limit) || 10, 100));
    const { status, search, sortBy = "createdAt", order = "desc" } = query;

    const allowedSortFields = ["createdAt", "total"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const where: any = {
        organizationId: user.organizationId,
    };

    if (status && status !== "ALL") {
        where.status = status;
    }

    if (search) {
        where.customer = {
            name: {
                contains: search,
                mode: "insensitive",
            },
        };
    }


    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: {
                customer: { select: { name: true } },
            },
            orderBy: {
                [sortField]: sortOrder,
            },
            skip,
            take: limit,
        }),

        prisma.invoice.count({
            where,
        }),
    ]);

    return {
        data: invoices.map((inv) => ({
            id: inv.id,
            customerName: inv.customer.name,
            total: inv.total,
            status: inv.status,
            createdAt: inv.createdAt,
        })),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ^Delete an invoice (soft delete by marking status as 'cancelled')
export const deleteInvoice = async (id: string, user: any) => {
    // *Production Shield
    if (process.env.NODE_ENV === "production") {
        throw new Error("Hard delete is disabled in production. Use 'Cancel' instead.");
    }

    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: { id, organizationId: user.organizationId },
            include: { items: true },
        });

        if (!invoice) throw new Error("Invoice not found");

        // *Status Shield (Only delete mistakes/pending)
        if (invoice.status !== "PENDING") {
            throw new Error("Cannot delete an invoice that is already PAID or CANCELLED");
        }

        // *Restore Stock
        for (const item of invoice.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }

        // *Delete invoice items first due to foreign key constraints
        await tx.invoiceItem.deleteMany({
            where: { invoiceId: id }
        });

        // *Clean Delete
        await tx.invoice.delete({ where: { id } });

        return { message: "Test invoice removed and stock restored" };
    });
};

// ^Get Single Invoice
export const getInvoiceById = async (id: string, user: any) => {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id,
            organizationId: user.organizationId,
        },
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!invoice) throw new Error("Invoice not found");

    //  ^Clean Response
    return {
        id: invoice.id,
        status: invoice.status,
        createdAt: invoice.createdAt,
        // !Add customer details for the "Bill To" section
        customer: {
            name: invoice.customer.name,
            email: invoice.customer.email,
            address: invoice.customer.address,
        },
        // !Financial Breakdown
        financials: {
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            discount: invoice.discount,
            total: invoice.total,
        },
        items: invoice.items.map((item) => ({
            id: item.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.quantity * item.price,
        })),
    };
};

// ^Cancel an invoice (soft delete by marking status as 'cancelled')
export const cancelInvoice = async (id: string, user: any) => {
    return prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id,
                organizationId: user.organizationId,
            },
            include: { items: true },
        });

        if (!invoice) throw new Error("Invoice not found");

        if (invoice.status === "CANCELLED") {
            throw new Error("Invoice already cancelled");
        }

        // ^Restore stock
        for (const item of invoice.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: { increment: item.quantity },
                },
            });
        }

        // ^Update status
        const updated = await tx.invoice.update({
            where: { id },
            data: {
                status: "CANCELLED",
            },
        });
        // Audit Log: Invoice Cancelled
        await createAuditLog({
            action: "UPDATE",
            entity: "INVOICE",
            entityId: invoice.id,
            userId: user.id,
            organizationId: user.organizationId,
        });

        return {
            message: "Invoice cancelled successfully",
            id: updated.id,
            status: updated.status,
        };
    });
};

// ^Generateinvoices PDF


export const getInvoicePdf = async (id: string, user: any) => {
    const invoice = await getInvoiceById(id, user);

    const pdfBuffer = await generateInvoicePdf(invoice);

    return pdfBuffer;
};

// ^Mark invoice as paid
export const markInvoicePaid = async (id: string, user: any) => {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id,
            organizationId: user.organizationId,
        },
    });

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status === "PAID") {
        throw new Error("Invoice already paid");
    }

    if (invoice.status === "CANCELLED") {
        throw new Error("Cancelled invoice cannot be paid");
    }

    const updated = await prisma.invoice.update({
        where: { id },
        data: { status: "PAID" },
    });

    // Audit Log: Invoice Paid
    await createAuditLog({
        action: "UPDATE",
        entity: "INVOICE",
        entityId: invoice.id,
        userId: user.id,
        organizationId: user.organizationId,
    });

    return {
        message: "Invoice marked as PAID",
        id: updated.id,
        status: updated.status,
    };
};

