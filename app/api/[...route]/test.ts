import { Hono } from "hono";

const test = new Hono();

test.get("/test", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

test.post("/test", async (c) => {
  const body = await c.req.formData();

  console.log(body.get("name"));

  return c.json({
    message: `Hello from Hono! `,
  });
});

export default test;
