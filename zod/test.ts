import { z } from "zod";

export const testValidator = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.string().min(2),
});

export const user = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.string().min(2),
});

export const auth = z.object({
  idToken: z.string(),
});
