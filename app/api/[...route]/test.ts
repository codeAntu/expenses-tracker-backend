import { Hono } from "hono";
const test = new Hono();
import { zValidator } from "@hono/zod-validator";
import { testValidator } from "@/zod/test";

test.get("/test", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

test.post("/test", zValidator("form", testValidator), async (c) => {
  const body = await c.req.formData();
  console.log(body.get("name"));

  // const { name, email, age } = await c.req.json();

  // console.log(name, email, age);

  return c.json({
    message: `Hello from Hono! `,
  });
});

export default test;
