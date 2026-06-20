import { z } from "zod";

export const createInvoiceSchema = z.object({
  customerId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
   tax: z.number().optional().default(0),
  discount: z.number().optional().default(0),
});