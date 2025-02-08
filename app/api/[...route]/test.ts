import { Hono } from "hono";

const test = new Hono();

test.get("/test", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

test.post("/test", async (c) => {
  const { name } = await c.req.json();

  return c.json({
    message: `Hello from Hono!`,
  });
});

export default test;
