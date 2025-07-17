import { pgTable } from "drizzle-orm/pg-core";
import { Description, Id, Name, createdAt, updatedAt } from ".";
import { accountRef } from "./accounts";
import { userRef } from "./users";

export const payees = pgTable("payees", {
  id: Id,
  name: Name,
  description: Description,
  userId: userRef(),
  accountId: accountRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
