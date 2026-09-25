import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, ""))
  .refine((val) => val.length >= 10 && val.length <= 15, {
    message: "Mobile number must be between 10 and 15 digits",
  });

export const userRegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be under 100 characters"),
    mobileNumber: phoneSchema,
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be under 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const userLoginSchema = z.object({
  mobileNumber: phoneSchema,
  password: z.string().min(1, "Password is required"),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
