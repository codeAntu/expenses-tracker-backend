import { Hono } from "hono";
import { handle } from "hono/vercel";
import test from "./test";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { eq } from "drizzle-orm";
import user from "./user";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");
app.route("/", test);
app.route("/", user);


export const GET = handle(app);
export const POST = handle(app);
