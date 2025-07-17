import { pgTable } from "drizzle-orm/pg-core";
import { Description, Id, amount, createdAt, updatedAt } from ".";
import { accountRef } from "./accounts";
import { userRef } from "./users";

export const transfers = pgTable("transfers", {
  id: Id,
  amount: amount("amount"),
  description: Description.notNull(),
  fromAccountId: accountRef("from_account_id"),
  toAccountId: accountRef("to_account_id"),
  userId: userRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
