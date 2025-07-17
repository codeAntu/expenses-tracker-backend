import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import {
  amount,
  createdAt,
  Description,
  Id,
  transactionTypeEnum,
  updatedAt,
} from ".";
import { accountRef } from "./accounts";
import { userRef } from "./users";

export const transactions = pgTable("transaction", {
  id: Id,
  amount: amount("amount"),
  description: Description.notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  userId: userRef(),
  accountId: accountRef(),
  referenceId: uuid("reference_id"),
  referenceType: varchar("reference_type", { length: 32 }),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
