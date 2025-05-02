import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import auth from "./auth";
import test from "./test";
import transaction from "./transaction";

export const runtime = "nodejs";

const app = new Hono().basePath("");
app.use("*", cors({
  origin: ["http://localhost:5173", "https://alibaba-x.vercel.app/"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

const testRoute = app.route("/api/test", test);
const authRoute = app.route("/api/auth", auth);
const transactionRoute = app.route("/api/transaction", transaction);

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
  | typeof transactionRoute;
