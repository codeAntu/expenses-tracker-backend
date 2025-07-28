import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { TRANSACTION_TYPES } from "@/utils/types/types";
import { and, desc, eq } from "drizzle-orm";

export async function getExpensesByAccountId(
  userId: string,
  accountId: string
) {
  try {
    const expenses = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.accountId, accountId),
          eq(transactionsTable.transactionType, TRANSACTION_TYPES.EXPENSE)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));
    return expenses;
  } catch (error) {
    throw new Error("Failed to retrieve expenses by account: " + error);
  }
}
