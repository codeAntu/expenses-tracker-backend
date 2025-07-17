import { pgTable, uuid } from "drizzle-orm/pg-core";
import {
  Color,
  Description,
  Icon,
  Id,
  Name,
  amount,
  createdAt,
  transactionTypeEnum,
  updatedAt,
} from ".";
import { userRef } from "./users";

// Function to reference accounts table
export function accountRef(columnName: string = "account_id") {
  return uuid(columnName).references(() => Accounts.id, {
    onDelete: "cascade",
  });
}

export const Accounts = pgTable("accounts", {
  id: Id,
  name: Name,
  description: Description,
  balance: amount("balance"),
  accountType: transactionTypeEnum("account_type").notNull(),
  icon: Icon,
  color: Color,
  userId: userRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
