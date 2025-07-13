import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import auth from "./auth";
import test from "./test";
import transaction from "./transaction";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://alibaba-x.vercel.app/"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

const testRoute = app.route("/test", test);
const authRoute = app.route("/auth", auth);
const transactionRoute = app.route("/api/transaction", transaction);

const hello = app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = handle(app);
export const POST = handle(app);

export type AppType =
  | typeof app
  | typeof hello
  | typeof testRoute
  | typeof authRoute
  | typeof transactionRoute;
