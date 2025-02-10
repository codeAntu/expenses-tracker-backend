import { authValidator } from "@/zod/auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import admin from "firebase-admin";

export const runtime = "edge";

const app = new Hono().basePath("/api");
app.use("*", cors({ origin: "*" }));

const hello = app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

const helloPost = app.post("/hello", async (c) => {
  const formData = await c.req.formData();
  const name = formData.get("name");
  console.log(name);
  return c.json({
    message: "Hello from Hono!",
  });
});

const authRoute = app.post(
  "/auth",
  zValidator("form", authValidator),
  async (c) => {
    const { idToken } = await c.req.valid("form");

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    console.log(decodedToken);

    return c.json({
      message: `Hello from Hono! ${idToken}`,
    });
  }
);

export const GET = handle(app);
export const POST = handle(app);
export default app;

export type AppType =
  | typeof app
  | typeof hello
  | typeof helloPost
  | typeof authRoute;
