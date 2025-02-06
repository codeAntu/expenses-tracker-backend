import { Hono } from "hono";
import { handle } from "hono/vercel";
import test from "./test";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";
// import db from "@/db";

export const runtime = "nodejs";
const db = drizzle(process.env.DATABASE_URL!);

const app = new Hono().basePath("/api");
app.route("/", test);

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

app.get("/add-user", (c) => {
  return c.json({
    message: "user",
  });
});

app.post("/add-user", async (c) => {
  // const user: typeof usersTable.$inferInsert = {
  //   name: "new",
  //   age: 30,
  //   email: "2@example.com",
  // };

  // const data = await db.insert(usersTable).values(user).returning({
  //   name: usersTable.name,
  // });

  // console.log(data);

  // console.log("New user created!");

  // const users = await db.select().from(usersTable);
  // console.log("Getting all users from the database: ", users);

  return c.json({
    message: "User created",
  });
});

export const GET = handle(app);
export const POST = handle(app);
