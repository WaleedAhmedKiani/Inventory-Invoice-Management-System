import { prisma } from "../../config/db.js";
import { createAuditLog } from "../../utils/auditLog.js";

// ^Create Customer
export const createCustomer = async (data: any, user: any) => {

  const count = await prisma.customer.count({
    where: { organizationId: user.organizationId },
  });

  const limit = user.organization?.limits?.customers;

  if (limit !== null && limit !== undefined && count >= limit) {
    throw new Error("Customer limit reached. Upgrade required.");
  }
  const customer = await prisma.customer.create({
    data: {
      ...data,
      organizationId: user.organizationId,
    },
  });

  // Audit Log: Customer Created
  await createAuditLog({
    action: "CREATE",
    entity: "CUSTOMER",
    entityId: customer.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  };
};

// ^Get Customers with Pagination and Search
export const getCustomers = async (user: any, query: any) => {
  const page = Math.max(1, Number(query.page) || 1); // Ensure page is at least 1
  const limit = Math.max(1, Number(query.limit) || 10);
  const search = query.search?.trim() || ""; // Trim whitespace
  const skip = (page - 1) * limit;

  // Build the filter object
  const where: any = {
    organizationId: user.organizationId,
  };

  // Only add the OR search if a search string actually exists
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        invoices: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    // map the customers to only return necessary fields
    data: customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      invoices: c.invoices || [],
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ^Update Customer
export const updateCustomer = async (
  id: string,
  data: any,
  user: any
) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!customer) throw new Error("Customer not found");

  const updated = await prisma.customer.update({
    where: { id },
    data,
  });

  // Audit Log: Customer Updated
  await createAuditLog({
    action: "UPDATE",
    entity: "CUSTOMER",
    entityId: customer.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    address: updated.address,
  };
};

// ^Delete Customer
export const deleteCustomer = async (id: string, user: any) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!customer) throw new Error("Customer not found");

  await prisma.customer.delete({
    where: { id },
  });
  
  // Audit Log: Customer Deleted
  await createAuditLog({
    action: "DELETE",
    entity: "CUSTOMER",
    entityId: customer.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  return { message: "Customer deleted" };
};