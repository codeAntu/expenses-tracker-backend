import { z } from "zod";

export const authValidator = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const tokenValidator = z.object({
  token: z.string().min(1, "Token is required"),
});

export const registerValidator = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileUpdateValidator = z.object({
  name: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const passwordResetValidator = z.object({
  email: z.string().email("Valid email is required"),
});
