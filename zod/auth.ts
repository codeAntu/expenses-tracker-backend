import { z } from "zod";

export const authValidator = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const tokenValidator = z.object({
  token: z.string().min(1, "Token is required"),
});
