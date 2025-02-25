import db from "@/db";
import { users } from "@/db/schema";
import admin, { auth } from "@/firebase";
import { authValidator } from "@/zod/auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const authRoute = new Hono()
  .post("/", zValidator("form", authValidator), async (c) => {
    const data = await c.req.formData();
    const idToken = data.get("idToken");

    // verifyIdToken from Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken as string);
    console.log(decodedToken);

    if (!decodedToken) {
      return c.json({
        message: "Unauthorized",
      });
    }
    if (!decodedToken.email_verified) {
      return c.json({
        message: "Email not verified",
      });
    }
    if (!decodedToken.email) {
      return c.json({
        message: "Email not found",
      });
    }

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
      .createCustomToken(user.id.toString(), { expiresIn: "5y" });

    setCookie(c, "userToken", token, {
      httpOnly: true,
      secure: true,
    });

    return c.json({
      message: "Authenticated",
      user,
    });
  })
  .get("/", async (c) => {
    const token = getCookie(c, "userToken");

    if (!token) {
      return c.json({ message: "Token not found " }, 401);
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = decoded;

    return c.json({
      message: "Hello from Hono!",
      user,
    });
  });

export default authRoute;
