import { isLoggedIn } from "@/middleware/checkLogin";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import accountRouter from "./accounts";
import auth from "./auth";
import test from "./test";
import transaction from "./transaction";
import expense from "./expense";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// TODO: Have to fix the rate limit, it takes too long to respond
// const apiRateLimit = rateLimit({
//   windowMs: 60 * 1000,
//   maxRequests: 100,
//   keyGenerator: (c) => {
//     const clientIP = c.req.header("x-forwarded-for") || "unknown";
//     return `expenses-tracker:rate_limit:${clientIP}`;
//   },
// });

// app.use("*", apiRateLimit);

// Apply authentication middleware to protected routes
app.use("/account/*", isLoggedIn);
app.use("/transaction/*", isLoggedIn);
app.use("/test/*", isLoggedIn);
app.use("/expenses/*", isLoggedIn);

const testRoute = app.route("/test", test);
const authRoute = app.route("/auth", auth);
const accountRoute = app.route("/account", accountRouter);
const transactionRoute = app.route("/transaction", transaction);
const expensesRoute = app.route("/expenses", expense);

const hello = app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const PUT = handle(app);

export type AppType =
  | typeof app
  | typeof hello
  | typeof testRoute
  | typeof authRoute
  | typeof transactionRoute
  | typeof accountRoute
  | typeof expensesRoute;
