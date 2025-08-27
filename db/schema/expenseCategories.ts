import { pgTable } from "drizzle-orm/pg-core";
import { accountRef } from "./accounts";
import {
  amount,
  Color,
  createdAt,
  Description,
  Icon,
  Id,
  Name,
  updatedAt,
} from "./common";
import { userRef } from "./users";

export const expenseCategories = pgTable("expense_categories", {
  id: Id,
  name: Name,
  description: Description,
  totalExpense: amount("total_expense"),
  icon: Icon,
  color: Color,
  userId: userRef(),
  accountId: accountRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
