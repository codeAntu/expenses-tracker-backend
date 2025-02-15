import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { testValidator } from "@/zod/test";

const test = new Hono()
  .get("/", (c) => {
    return c.json({
      message: "Hello from Hono!",
    });
  })
  .post("/", zValidator("form", testValidator), async (c) => {
    const { name, email, age } = c.req.valid("form");

    console.log(name, email, age);

    return c.json({
      message: `Hello from Hono! `,
    });
  });

export default test;
