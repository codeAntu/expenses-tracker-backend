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
} from ".";
import { userRef } from "./users";

export const expenseCategories = pgTable("expense_categories", {
  id: Id,
  name: Name,
  description: Description,
  totalExpense: amount("total_expense"),
  icon: Icon,
  color: Color,
  userId: userRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
