import db from "@/db";
import { transactions as transactionsTable, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const transaction = new Hono();

transaction.get("/", async (c) => {
  // find all transactions related to the user
  const userId = "6a1ecb99-6571-4d0c-871f-0cdfb7dfe1cd";
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId));

  return c.json({
    transactions,
  });
});

transaction.post("/", async (c) => {
  const amount = 100.0;
  const description = "test";
  const transactionType = "income";
  const userId = "6a1ecb99-6571-4d0c-871f-0cdfb7dfe1cd";
  const tags = ["tag1", "tag2"];

  const transaction = await db
    .insert(transactionsTable)
    .values({
      amount,
      description,
      transactionType,
      userId,
    })
    .returning({
      id: transactionsTable.id,
    });

  // update the current_amount of the user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const totalAmount = parseFloat(user[0].totalAmount) + amount;

  const updatedAmount = await db
    .update(users)
    .set({
      totalAmount: totalAmount.toString(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      amount: users.totalAmount,
    });

  return c.json({
    message: "Transaction created",
    transaction,
    updatedAmount,
  });
});

export default transaction;
