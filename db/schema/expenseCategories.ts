import { pgTable } from "drizzle-orm/pg-core";
import {
  amount,
  Color,
  createdAt,
  Description,
  Icon,
  Id,
  Name,
  updatedAt,
} from "./index";
import { userRef } from "./users";
import { accountRef } from "./accounts";

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
