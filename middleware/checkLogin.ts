import { Responses } from "@/utils/responses";
import { Token } from "@/utils/types/userTypes";
import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const isLoggedIn = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(Responses.unauthorized("No token provided"), 401);
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Token;

    const user = decoded;

    if (!user) {
      return c.json(Responses.notFound("User not found"), 404);
    }
    c.set("user", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    await next();
  } catch (err) {
    return c.json(Responses.unauthorized("Invalid or expired token"), 401);
  }
};
