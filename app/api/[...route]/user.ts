import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const user = new Hono();

user.get("/user", async (c) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, "6a1ecb99-6571-4d0c-871f-0cdfb7dfe1cd"))
    .limit(1);

  return c.json({
    message: "Hello from Hono!",
    user: user[0],
  });
});

user.post("/user", async (c) => {
  const userId = await db
    .insert(users)
    .values({
      name: "test",
      username: "test",
      email: "test",
    })
    .returning({
      id: users.id,
    });

  console.log("User created", userId);

  return c.json({
    message: "User created",
    userId,
  });
});

export default user;
