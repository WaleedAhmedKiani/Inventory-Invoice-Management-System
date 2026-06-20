import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();