import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be >= 0"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
});