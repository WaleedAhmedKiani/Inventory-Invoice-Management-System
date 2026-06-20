import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(), 
});

export const updateCustomerSchema = createCustomerSchema.partial();