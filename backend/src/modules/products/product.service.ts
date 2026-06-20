import { prisma } from "../../config/db.js";
import redis from "../../config/redis.js"; // Ensure this path is correct
import { createAuditLog } from "../../utils/auditLog.js";
import { logger } from "../../utils/logger.js";

const getCacheKey = (orgId: string) => `products:${orgId}`;

// ^Create a product within the user's organization
export const createProduct = async (data: any, user: any) => {

  // Plan Limit Check: Only for FREE plan, limit to 10 products
  const organization = await prisma.organization.findUnique({
    where: {
      id: user.organizationId,
    },
    select: {
      plan: true,
    },
  });

  const currentProducts = await prisma.product.count({
    where: {
      organizationId: user.organizationId,
      isDeleted: false,
    },
  });

  // FREE PLAN LIMIT = 10
  if (
    organization?.plan === "FREE" &&
    currentProducts >= 10
  ) {
    throw new Error(
      "FREE plan product limit reached. Upgrade to PRO."
    );
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      organizationId: user.organizationId,
    },
  });

  // Audit Log: Product Created
  await createAuditLog({
    action: "CREATE",
    entity: "PRODUCT",
    entityId: product.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  // INVALIDATE CACHE: New product created, delete the old list in Redis
  await redis.del(getCacheKey(user.organizationId));

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    sku: product.sku,
    barcode: product.barcode,
    imageUrl: product.imageUrl,
  };
};

// ^Get all products for the user's organization (WITH CACHING)

export const getProducts = async (user: any, query: any) => {
  // If 'query' itself is completely undefined from the controller, fallback to empty object safely
  const queryData = query || {}; 

  const page = Math.max(1, Number(queryData.page) || 1);
  const limit = Math.max(1, Number(queryData.limit) || 10);
  const search = queryData.search?.trim() || "";
  const skip = (page - 1) * limit;

  // Dynamic cache key matching page and search filter criteria
  const cacheKey = `products:${user?.organizationId}:page:${page}:limit:${limit}:search:${search}`;

  // Try to get from Redis
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.debug({ orgId: user?.organizationId }, "Product Cache Hit");
      console.log(" [Redis Cache]: HIT for key:", cacheKey);
      return JSON.parse(cachedData);
    }
  } catch (err) {
    logger.error({ err }, "Redis error reading product cache");
  }

  logger.info({ orgId: user?.organizationId }, "Product Cache Miss - Fetching DB");

  // Build the filter condition
  const where: any = {
    organizationId: user?.organizationId,
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }

  //  ---  PRISMA QUERY INPUT LOG ---
 
  console.log(" Raw Incoming query object:", query);
  console.log(" user.organizationId parsed as:", user?.organizationId);
  console.log(" Final Search string evaluated:", `"${search}"` , `(Length: ${search.length})`);
  console.log(` Math Calculations: Page=${page} | Limit=${limit} | Skip=${skip}`);
  console.log(" Full Prisma 'where' clause:", JSON.stringify(where, null, 2));
 

  // Fetch count and paginated items concurrently
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  //  ---  PRISMA OUTPUT RESULTS LOG ---
  
  console.log(" Raw DB array length (products.length):", products.length);
  console.log(" Total matching count in DB (total):", total);
  if(products.length > 0) {
    console.log(" First item preview:", { id: products[0].id, name: products[0].name });
  } else {
    console.log(" Database returned NO items for these parameters.");
  }
  

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    sku: p.sku,
    barcode: p.barcode,
    imageUrl: p.imageUrl,
  }));

  const responseData = {
    data: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Save to Redis for 5 minutes (300 seconds)
  if (formattedProducts.length > 0) {
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 300);
      console.log("💾 [Redis Cache]: Saved new data under key:", cacheKey);
    } catch (err) {
      logger.error({ err }, "Redis error setting product cache");
    }
  }

  return responseData;
};
// ^Update a product by user's organization
export const updateProduct = async (id: string, data: any, user: any) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!product) throw new Error("Product Not Found");

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });

  // Audit Log: Product Updated
  await createAuditLog({
    action: "UPDATE",
    entity: "PRODUCT",
    entityId: product.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  // INVALIDATE CACHE: Data changed, delete old list
  await redis.del(getCacheKey(user.organizationId));

  return {
    id: updatedProduct.id,
    name: updatedProduct.name,
    price: updatedProduct.price,
    stock: updatedProduct.stock,
    sku: updatedProduct.sku,
    barcode: updatedProduct.barcode,
    imageUrl: updatedProduct.imageUrl,
  };
};

// ^Delete a product by user's organization
export const deleteProduct = async (id: string, user: any) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!product) throw new Error("Product not found");

  const deleted = await prisma.product.update({
    where: { id, organizationId: user.organizationId },
    data: { isDeleted: true },
  });

  // Audit Log: Product Deleted
  await createAuditLog({
    action: "DELETE",
    entity: "PRODUCT",
    entityId: product.id,
    userId: user.id,
    organizationId: user.organizationId,
  });

  // INVALIDATE CACHE: Product deleted, delete old list
  await redis.del(getCacheKey(user.organizationId));

  return deleted;
};