import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length ? result[0] : null;
}

export { findUserByEmail };
