import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}
