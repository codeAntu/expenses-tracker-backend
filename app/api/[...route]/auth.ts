import { Hono } from "hono";
import admin from "firebase-admin";


const auth = new Hono()
  .post("/", async (c) => {
    const data = await c.req.formData();

    console.log(data);

    return c.json({
      message: "Hello from Hono!",
    });
  })
  .get("/", async (c) => {
    return c.json({
      message: "Hello from Hono!",
    });
  });

export default auth;

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
