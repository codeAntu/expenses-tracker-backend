import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { accountRef } from "./accounts";
import {
  amount,
  createdAt,
  Description,
  Id,
  transactionTypeEnum,
  updatedAt,
} from "./common";
import { userRef } from "./users";

export const transactionsTable = pgTable("transaction", {
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
