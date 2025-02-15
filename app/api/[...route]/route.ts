import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import test from "./test";
import auth from "./auth";
import user from "./user";
import transaction from "./transaction";

export const runtime = "node";

const app = new Hono().basePath("/api");
app.use("*", cors({ origin: "*" }));

const testRoute = app.route("/test", test);
const authRoute = app.route("/auth", auth);
const userRoute = app.route("/user", user);
const transactionRoute = app.route("/transaction", transaction);

const hello = app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = handle(app);
export const POST = handle(app);
export default app;

export type AppType =
  | typeof app
  | typeof hello
  | typeof testRoute
  | typeof authRoute
  | typeof userRoute
  | typeof transactionRoute;
