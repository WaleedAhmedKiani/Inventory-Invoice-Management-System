import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z.string().optional(),

  address: z.string().optional(),
});

export type CustomerFormData = z.infer<
  typeof customerSchema
>;