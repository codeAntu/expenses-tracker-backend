import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");
app.use("*", cors({ origin: "*" }));

const hello = app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = handle(app);
export const POST = handle(app);
export default app;
export type AppType = typeof app | typeof hello;
