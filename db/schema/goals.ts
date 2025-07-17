import { pgTable, timestamp } from "drizzle-orm/pg-core";
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
import { accountRef } from "./accounts";
import { userRef } from "./users";

export const goals = pgTable("goals", {
  id: Id,
  name: Name,
  description: Description,
  targetAmount: amount("target_amount"),
  currentAmount: amount("current_amount"),
  targetDate: timestamp("target_date").notNull(),
  icon: Icon,
  color: Color,
  userId: userRef(),
  accountId: accountRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
