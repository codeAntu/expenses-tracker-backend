import { pgTable, uuid } from "drizzle-orm/pg-core";
import {
  Color,
  Description,
  Icon,
  Id,
  Name,
  amount,
  createdAt,
  updatedAt,
} from "./index";
import { userRef } from "./users";

// Function to reference accounts table
export function accountRef(columnName: string = "account_id") {
  return uuid(columnName).references(() => Accounts.id, {
    onDelete: "cascade",
  });
}

export const Accounts = pgTable("accounts", {
  id: Id,
  title: Name,
  description: Description,
  balance: amount("balance"),
  icon: Icon,
  color: Color,
  userId: userRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
