import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    organizationName: z.string().min(2, "Organization required"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });