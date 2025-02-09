import { Hono } from "hono";
import admin from "firebase-admin";
const auth = new Hono();

auth.post("/", async (c) => {
  // const { token } = await c.req.json();
  // const { email, name } = await c.req.json();
  const data = await c.req.formData();

  console.log(data);

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
