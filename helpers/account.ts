import db from "@/db";
import { Accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const ICON = "";
const COLOR = "";

export async function createAccount(
  userId: string,
  name: string,
  description: string,
  icon?: string,
  color?: string
) {
  try {
    return await db
      .insert(Accounts)
      .values({
        userId,
        name,
        description,
        icon: icon || ICON,
        color: color || COLOR,
      })
      .returning()
      .then((result) => result[0]);
  } catch (error) {
    throw error;
  }
}

export async function getAllAccounts(userId: string) {
  return await db
    .select()
    .from(Accounts)
    .where(eq(Accounts.userId, userId))
    .orderBy(desc(Accounts.createdAt));
}
