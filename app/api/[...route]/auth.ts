import { Hono } from "hono";
import admin from "firebase-admin";
const auth = new Hono();

auth.post("/", async (c) => {
  // { token },
  // { headers: { 'Content-Type': 'application/json' } },

  const { token } = await c.req.json();

  return c.json({
    message: "Hello from Hono!",
  });
});

auth.get("/", async (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export default auth;
