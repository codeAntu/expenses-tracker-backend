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

    // Check if user exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.name, decodedToken.name));

    // If user does not exist, create a new user
    if (existingUser.length === 0) {
      const newUser: typeof users.$inferInsert = {
        name: decodedToken.name,
        username: decodedToken.name ? decodedToken.name : "",
        email: decodedToken.email ? decodedToken.email : "",
        totalAmount: "0",
      };
      const user = await db.insert(users).values(newUser);
      console.log(user);
    }

    // Create a session cookie
    const cookie = await admin
      .auth()
      .createSessionCookie(idToken as string, { expiresIn: 60 * 60 * 24 * 5 });

    console.log(cookie);

    setCookie(c, "session", cookie);

    return c.json({
      message: "Authenticated",
    });
  })
  .get("/", async (c) => {
    // check cookie
    const allCookies = getCookie(c);
    const firebaseCookie = getCookie(c, "session");

    console.log("Firebase cookie", firebaseCookie);

    console.log("All cookies", allCookies);

    // verify session cookie
    // try {
    //   await admin.auth().verifySessionCookie(firebaseCookie);
    //   return c.json({
    //     message: "Protected route",
    //   });
    // } catch (e) {
    //   return c.json({
    //     message: "Unauthorized",
    //   });
    // }

    return c.json({
      message: "Hello from Hono!",
    });
  });

export default authRoute;

// const helloPost = app.post("/hello", async (c) => {
//   const formData = await c.req.formData();
//   const name = formData.get("name");
//   console.log(name);
//   return c.json({
//     message: "Hello from Hono!",
//   });
// });

// const authRoute = app.post("/auth", async (c) => {
//   const data = await c.req.formData();
//   const idToken = data.get("idToken");

//   if (!idToken) {
//     return c.json({
//       message: "No idToken provided",
//     });
//   }

//   const cookie = await admin
//     .auth()
//     .createSessionCookie(idToken as string, { expiresIn: 60 * 60 * 24 * 5 });

//   setCookie(c, "session", cookie);

//   return c.json({
//     message: "Authenticated",
//   });
// });

// const authProtectedRoute = app.get("/protected", async (c) => {
//   const sessionCookie = getCookie(c, "session");
//   if (!sessionCookie) {
//     return c.json({
//       message: "Unauthorized",
//     });
//   }

//   try {
//     await admin.auth().verifySessionCookie(sessionCookie);
//     return c.json({
//       message: "Protected route",
//     });
//   } catch (e) {
//     return c.json({
//       message: "Unauthorized",
//     });
//   }
// });
