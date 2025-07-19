import { Context } from "hono";
import { Token } from "./types/userTypes";

export function getUser(c: Context): Token {
  return c.get("user") as Token;
}
