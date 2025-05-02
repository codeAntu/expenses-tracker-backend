import db from "@/db";
import { users } from "@/db/schema";
import admin, { auth } from "@/firebase";
import { authValidator } from "@/zod/auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const authRoute = new Hono().post(
  "/",
  zValidator("form", authValidator),
  async (c) => {
    const data = await c.req.formData();
    const idToken = data.get("idToken");

    // verifyIdToken from Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken as string);

    console.log(decodedToken);

    if (!decodedToken)
      return c.json({ message: "Unauthorized", user: null }, 401);
    if (!decodedToken.email_verified)
      return c.json({ message: "Email not verified", user: null }, 401);
    if (!decodedToken.email)
      return c.json({ message: "Email not found", user: null }, 401);

    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, decodedToken.email))
      .limit(1);

    let user = existingUser[0];

    // If user does not exist, create a new user
    if (!user) {
      const newUser = await db
        .insert(users)
        .values({
          name: decodedToken.name,
          email: decodedToken.email,
          totalAmount: "0",
        })
        .returning();
      user = newUser[0];
    }

    // create a custom token
    const userToken = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await admin
      .auth()
      .createCustomToken(userToken.toString(), { expiresIn: "5y" });

    return c.json(
      {
        message: "Successfully logged in",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          totalAmount: user.totalAmount,
          picture: decodedToken.picture?.toString() || "",
          token,
        },
      },
      200
    );
  }
);

export default authRoute;
