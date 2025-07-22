import db from "@/db";
import { users } from "@/db/schema";
import admin, { auth } from "@/firebase";
import { createAccount } from "@/helpers/account";
import { Responses } from "@/utils/responses";
import { Token } from "@/utils/types/userTypes";
import { authValidator } from "@/zod/auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

function createToken(user: Token) {
  return admin.auth().createCustomToken(user.id, {
    id: user.id,
    email: user.email,
    name: user.name,
  });
}

const authRoute = new Hono().post(
  "/firebase",
  zValidator("form", authValidator),
  async (c) => {
    try {
      const data = await c.req.formData();
      const idToken = data.get("idToken");

      // verifyIdToken from Firebase Admin SDK
      const decodedToken = await auth.verifyIdToken(idToken as string);

      if (!decodedToken) {
        return c.json(Responses.unauthorized("Unauthorized"), 401);
      }
      if (!decodedToken.email_verified) {
        return c.json(Responses.unauthorized("Email not verified"), 401);
      }
      if (!decodedToken.email) {
        return c.json(Responses.notFound("Email"), 401);
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
            picture: decodedToken.picture?.toString() || "",
          })
          .returning();
        user = newUser[0];

        await createAccount(user.id, {
          name: "Main Account",
          description: "This is your main account.",
        });
      }

      const userToken = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const token = await createToken(userToken);

      return c.json(
        Responses.success("Successfully authenticated", {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture || "",
          token,
        })
      );
    } catch (error) {
      console.error("Auth error:", error);
      return c.json(Responses.serverError("Authentication failed"), 500);
    }
  }
);

export default authRoute;
