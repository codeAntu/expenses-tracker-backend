import { Hono } from "hono";
import { handle } from "hono/vercel";
import test from "./test";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { eq } from "drizzle-orm";
import user from "./user";
import { cors } from "hono/cors";
import transaction from "./transaction";
import auth from "./auth";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// app.use(
//   "*",
//   cors({
//     origin: "*",
//   })
// );

// app.route("/", test);
// app.route("/", user);
// app.route("/transactions", transaction);
// app.route("/auth", auth);

// export const GET = handle(app);
// export const POST = handle(app);

export const hono = new Hono().basePath("/api");
export type HonoApp = typeof hono;

const testRoute = hono.route("/", test);
const userRoute = hono.route("/", user);
const transactionRoute = hono.route("/transactions", transaction);
const authRoute = hono.route("/auth", auth);

const route = hono.get("/", async (c) => {
  return c.json({
    message: "Hello from hono",
    status: true,
  });
});

route.use(
  "*",
  cors({
    origin: "*",
  })
);

export type AppType =
  | typeof route
  | typeof testRoute
  | typeof userRoute
  | typeof transactionRoute
  | typeof authRoute;
