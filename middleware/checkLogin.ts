import admin from "@/firebase";
import { getUserById } from "@/helpers/user";
import { Responses } from "@/utils/responses";
import { Token } from "@/utils/types/userTypes";
import { Context, Next } from "hono";

export const isLoggedIn = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(Responses.unauthorized("No token provided"), 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const decoded: Token = {
      id: decodedToken.uid,
      name: decodedToken.name ?? "",
      email: decodedToken.email ?? "",
    };

    // cache the user with radis
    const user = await getUserById(decoded.id);

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
