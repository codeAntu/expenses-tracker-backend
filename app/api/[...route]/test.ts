import { Hono } from "hono";

const test = new Hono();

test.get("/test", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

export default test;
